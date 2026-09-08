import { GOAL_START, GOAL_TARGET } from '../support/commands';

/** Headed-friendly spec: CNT-AI-7 watch mode drives betting + basic strategy. */
describe('Watch CNT-AI-7 (headed)', () => {
    const MAX_WAIT_MS = 12 * 60 * 1000;
    const POLL_MS = Math.max(3000, Number(Cypress.env('ACTION_PAUSE_MS') ?? 50));

    const waitForAiSession = (startedAt = Date.now(), lastChips = GOAL_START, idleRounds = 0) => {
        cy.get('[data-testid="player-chips"]')
            .invoke('text')
            .then((text) => {
                const chips = Number.parseInt(text.replace(/[^\d]/g, ''), 10);
                cy.task('log', `CNT-AI-7 · bankroll $${chips}`);

                if (chips >= GOAL_TARGET) {
                    cy.task('log', `Goal hit! $${chips}`);
                    return;
                }

                if (chips < 5) {
                    cy.task('log', `Busted at $${chips}`);
                    return;
                }

                if (Date.now() - startedAt >= MAX_WAIT_MS) {
                    cy.task('log', `Time limit reached at $${chips}`);
                    return;
                }

                const nextIdle = chips === lastChips ? idleRounds + 1 : 0;
                if (nextIdle >= 8) {
                    throw new Error(
                        `AI stalled at $${chips} — no gameplay for ${nextIdle * (POLL_MS / 1000)}s`,
                    );
                }

                cy.wait(POLL_MS, { log: false });
                waitForAiSession(startedAt, chips, nextIdle);
            });
    };

    beforeEach(() => {
        cy.visit('/');
        cy.getBlackjack();
    });

    it('shuffles, enables AI watch mode, and plays until bust/double/timeout', () => {
        cy.get('[data-testid="deck-count-1"]').click();
        cy.get('[data-testid="ai-watch-start"]').click();
        cy.get('[data-testid="ai-watch-mode"]').should('contain', 'ON');
        cy.get('[data-testid="shuffle-deck"]').click();
        cy.waitForNotBusy();
        cy.get('[data-testid="player-chips"]').should('contain', `$${GOAL_START}`);
        cy.get('[data-testid="ai-player-toggle"]').should('contain', 'AI ON');

        cy.window({ timeout: 20000 }).should((win) => {
            const snap = win.__BLACKJACK__.getSnapshot();
            expect(snap.gameState).to.be.oneOf([
                'Player Phase',
                'Dealer Phase',
                'Game Concluded',
                'Cards Dealt',
            ]);
        });

        waitForAiSession();

        cy.get('[data-testid="player-chips"]').should(($el) => {
            const chips = Number.parseInt($el.text().replace(/[^\d]/g, ''), 10);
            expect(chips, 'bankroll reached $1075 goal').to.be.at.least(GOAL_TARGET);
        });
    });
});
