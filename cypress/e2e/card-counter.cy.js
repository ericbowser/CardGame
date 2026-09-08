import { GOAL_START, GOAL_TARGET } from '../support/commands';

describe('Card counter — double the bankroll (PoC)', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.waitForTableReady();
        cy.getBlackjack();
        cy.ensureTableInView();
    });

    it('plays Hi-Lo basic strategy with a bet spread until $1075 or bust', () => {
        cy.prepareCounterShoe(1);
        cy.ensureTableInView();
        cy.get('[data-testid="true-count"]').should('exist');
        cy.get('[data-testid="player-chips"]').should('contain', `$${GOAL_START}`);

        cy.playCounterSession({ goal: GOAL_TARGET });

        cy.get('[data-testid="player-chips"]')
            .invoke('text')
            .then((text) => {
                const chips = Number.parseInt(text.replace(/[^\d]/g, ''), 10);
                cy.task('log', '\n=== Counter run complete ===');
                cy.task('log', `Final bankroll: $${chips} (goal $${GOAL_TARGET})`);
                cy.task(
                    'log',
                    chips >= GOAL_TARGET
                        ? `Goal hit: $${chips}`
                        : `Short of $${GOAL_TARGET} — variance; re-run`,
                );
            });

        cy.get('[data-testid="player-chips"]').should(($el) => {
            const chips = Number.parseInt($el.text().replace(/[^\d]/g, ''), 10);
            expect(chips, 'bankroll reached $1075 goal').to.be.at.least(GOAL_TARGET);
        });
    });
});
