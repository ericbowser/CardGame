/** Mirror src/constants/game.js + src/utils/counterBetSpread.js */
const GOAL_START = 1000;
const GOAL_TARGET = 1075;
const GOAL_TARGET_DOUBLE = 2000;
const MAX_ROUNDS = 200;
const MAX_ROUNDS_DOUBLE = 500;

const ACTION_PAUSE_MS = Number(Cypress.env('ACTION_PAUSE_MS') ?? 50);
const WATCH_PACE = ACTION_PAUSE_MS >= 500;

function cyDebugLog(location, message, data, hypothesisId) {
    cy.window({ log: false }).then((win) => {
        if (typeof win.__DEBUG_LOG__ === 'function') {
            win.__DEBUG_LOG__(location, message, data, hypothesisId);
        }
    });
}

Cypress.Commands.add('getBlackjack', () =>
    cy.window().its('__BLACKJACK__').should('exist'),
);

Cypress.Commands.add('waitForDeckReady', (timeout = 60000) => {
    cy.window({ log: false, timeout }).should((win) => {
        const api = win.__BLACKJACK__;
        const ready =
            typeof api.isDeckReady === 'function'
                ? api.isDeckReady()
                : api.getSnapshot().deckReady;
        expect(ready, 'card images loaded').to.eq(true);
    });
});

Cypress.Commands.add('prepareCounterShoe', (deckCount = 1) => {
    cy.get(`[data-testid="deck-count-${deckCount}"]`).click();
    cy.waitForDeckReady();
    cy.get('[data-testid="shuffle-deck"]').click();
    cy.window({ log: false, timeout: 30000 }).should((win) => {
        expect(win.__BLACKJACK__.getSnapshot().isDeckShuffled, 'shoe shuffled').to.eq(true);
    });
    cy.waitForUiReady();
});

Cypress.Commands.add('waitForTableReady', (timeout = 45000) => {
    cy.get('[data-testid="table-ready"]', { timeout }).should('exist');
});

Cypress.Commands.add('ensureTableInView', () => {
    cy.get('[data-testid="table-canvas"]').scrollIntoView();
});

Cypress.Commands.add('blackjackSnapshot', () =>
    cy.getBlackjack().then((api) => api.getSnapshot()),
);

Cypress.Commands.add('waitForNotBusy', (timeout = 20000) => {
    cy.window({ log: false, timeout }).should((win) => {
        expect(win.__BLACKJACK__.getSnapshot().boardBusy).to.eq(false);
    });
});

Cypress.Commands.add('waitForUiReady', (timeout = 20000) => {
    cy.waitForNotBusy(timeout);
    cy.get('[data-testid="table-ready"]', { timeout }).should('exist');
});

Cypress.Commands.add('waitForStableHand', (timeout = 15000) => {
    const stableForMs = 250;
    let lastSig = null;
    let stableSince = null;

    cy.window({ log: false, timeout }).should((win) => {
        const snap = win.__BLACKJACK__.getSnapshot();
        const sig = win.__BLACKJACK__.getHandSignature();
        const now = Date.now();

        if (snap.boardBusy) {
            lastSig = null;
            stableSince = null;
            throw new Error('board busy');
        }

        if (sig !== lastSig) {
            lastSig = sig;
            stableSince = now;
            throw new Error(`hand changing (${sig})`);
        }

        if (stableSince == null || now - stableSince < stableForMs) {
            throw new Error('hand not stable yet');
        }
    });
});

Cypress.Commands.add('waitForInitialDeal', (timeout = 30000) => {
    cy.window({ log: false, timeout }).should((win) => {
        const snap = win.__BLACKJACK__.getSnapshot();
        expect(snap.boardBusy, 'board idle after deal').to.eq(false);
        expect(snap.playerHands[0]?.cards?.length ?? 0, 'player cards dealt').to.be.gte(2);
        expect(snap.dealerCards.length, 'dealer cards dealt').to.be.gte(2);
    });
    cy.contains('Player:', { timeout }).should('be.visible');
    cy.contains('Player:').invoke('text').should('not.match', /Player:\s*—/);
    cy.waitForStableHand(timeout);
});

Cypress.Commands.add('waitForGameState', (state, timeout = 30000) => {
    cy.window({ log: false, timeout }).should((win) => {
        expect(win.__BLACKJACK__.getSnapshot().gameState).to.eq(state);
    });
});

Cypress.Commands.add('pauseForVideo', () => {
    if (WATCH_PACE && ACTION_PAUSE_MS > 0) {
        cy.wait(ACTION_PAUSE_MS, { log: false });
    }
});

Cypress.Commands.add('selectChipBet', (amount) => {
    cy.get(`[data-testid="chip-${amount}"]`).scrollIntoView().click({ force: true });
    cy.get('[data-testid="bet-amount"]').should('contain', `$${amount}`);
});

Cypress.Commands.add('placeCounterBet', () => {
    const placeBetAmount = (amount) => {
        cy.getBlackjack().invoke('setBet', amount);
        cy.get('[data-testid="bet-amount"]').should(($el) => {
            const shown = Number.parseInt($el.text().replace(/[^\d]/g, ''), 10);
            expect(shown).to.eq(amount);
        });
    };

    cy.getBlackjack().then((api) => {
        const bet = api.getRecommendedBet();

        if (bet <= 0) {
            cy.getBlackjack().invoke('reshuffleShoe');
            cy.waitForUiReady();
            cy.window({ log: false, timeout: 15000 }).should((win) => {
                expect(win.__BLACKJACK__.getSnapshot().runningCount).to.eq(0);
            });
            cy.getBlackjack().then((api2) => {
                const retryBet = api2.getRecommendedBet() || 5;
                expect(retryBet, 'bet after wong reshuffle').to.be.gte(5);
                placeBetAmount(retryBet);
            });
            return;
        }

        placeBetAmount(bet);
    });
});

Cypress.Commands.add('playCounterHand', () => {
    const takeAction = (step = 0) => {
        if (step >= 16) {
            return;
        }

        cy.waitForUiReady();

        cy.blackjackSnapshot().then((snap) => {
            if (snap.gameState !== 'Player Phase' || snap.boardBusy) {
                return;
            }

            cy.getBlackjack().then((api) => {
                const action = api.getRecommendedAction();
                expect(action, 'basic strategy action').to.be.oneOf(['hit', 'stand', 'split']);

                const cardCountBefore = snap.activeHand?.cards?.length ?? 0;
                const handCountBefore = snap.playerHands?.length ?? 0;
                const sigBefore = api.getHandSignature();

                cy.get(`[data-testid="${action}"]`).scrollIntoView().click({ force: true });

                cy.window({ log: false, timeout: 20000 }).should((win) => {
                    const next = win.__BLACKJACK__.getSnapshot();
                    expect(next.boardBusy, 'action resolved').to.eq(false);

                    if (action === 'hit') {
                        const count = next.activeHand?.cards?.length ?? 0;
                        expect(count, 'card added after hit').to.be.gt(cardCountBefore);
                    } else if (action === 'split') {
                        expect(next.playerHands.length, 'split creates second hand').to.be.gt(handCountBefore);
                    } else {
                        expect(win.__BLACKJACK__.getHandSignature(), 'stand advances hand').not.to.eq(sigBefore);
                    }
                });

                cy.waitForStableHand();

                cy.window({ log: false }).then((win) => {
                    const after = win.__BLACKJACK__.getSnapshot();
                    if (after.gameState === 'Player Phase' && !after.boardBusy) {
                        takeAction(step + 1);
                    }
                });
            });
        });
    };

    takeAction();
});

Cypress.Commands.add('dealNextCounterHand', () => {
    cy.get('body').then(($body) => {
        const selector = $body.find('[data-testid="deal-again"]:visible').length > 0
            ? '[data-testid="deal-again"]'
            : '[data-testid="place-bet-deal"]';
        cy.get(selector).scrollIntoView().click({ force: true });
    });
});

Cypress.Commands.add('completeCounterRound', (isFollowUp = false) => {
    cy.ensureTableInView();
    cy.placeCounterBet();

    if (isFollowUp) {
        cy.dealNextCounterHand();
    } else {
        cy.get('[data-testid="place-bet-deal"]').scrollIntoView().click({ force: true });
    }

    cy.waitForInitialDeal();

    cy.blackjackSnapshot().then((snap) => {
        if (snap.gameState === 'Player Phase') {
            cy.playCounterHand();
        }
    });

    cy.waitForGameState('Game Concluded', 45000);
    cy.waitForStableHand();
});

Cypress.Commands.add('playCounterSession', (options = {}) => {
    const goal = options.goal ?? GOAL_TARGET;
    const maxRounds = options.maxRounds ?? MAX_ROUNDS;

    const playRound = (roundIndex) => {
        if (roundIndex >= maxRounds) {
            cy.task('log', `Max rounds (${maxRounds}) reached`);
            return;
        }

        cy.blackjackSnapshot().then((snap) => {
            cy.task(
                'log',
                `Round ${roundIndex + 1} · chips $${snap.playerChips} · RC ${snap.runningCount} · TC ${snap.trueCount} · goal $${goal}`,
            );

            if (snap.playerChips >= goal) {
                cy.task('log', `Goal reached: $${snap.playerChips} (target $${goal})`);
                return;
            }

            if (snap.playerChips < 5) {
                cy.task('log', `Busted at $${snap.playerChips}`);
                return;
            }

            if (snap.gameState === 'Player Phase') {
                cy.playCounterHand();
                cy.waitForGameState('Game Concluded', 45000);
                cy.waitForStableHand();
            } else {
                cy.completeCounterRound(roundIndex > 0);
            }

            cy.blackjackSnapshot().then((after) => {
                if (after.playerChips >= goal || after.playerChips < 5) {
                    return;
                }
                playRound(roundIndex + 1);
            });
        });
    };

    playRound(0);
});

export {
    GOAL_START,
    GOAL_TARGET,
    GOAL_TARGET_DOUBLE,
    MAX_ROUNDS,
    MAX_ROUNDS_DOUBLE,
    ACTION_PAUSE_MS,
};
