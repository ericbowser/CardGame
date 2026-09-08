import {
    GOAL_START,
    GOAL_TARGET_DOUBLE,
    MAX_ROUNDS_DOUBLE,
} from '../support/commands';

describe('Card counter — double bankroll to $2000', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.waitForTableReady();
        cy.getBlackjack();
        cy.ensureTableInView();
    });

    it('plays Hi-Lo basic strategy with a bet spread until $2000 or bust', () => {
        cy.prepareCounterShoe(1);
        cy.ensureTableInView();
        cy.get('[data-testid="true-count"]').should('exist');
        cy.get('[data-testid="player-chips"]').should('contain', `$${GOAL_START}`);

        cy.playCounterSession({
            goal: GOAL_TARGET_DOUBLE,
            maxRounds: MAX_ROUNDS_DOUBLE,
        });

        cy.get('[data-testid="player-chips"]')
            .invoke('text')
            .then((text) => {
                const chips = Number.parseInt(text.replace(/[^\d]/g, ''), 10);
                cy.task('log', '\n=== $2000 counter run complete ===');
                cy.task('log', `Final bankroll: $${chips} (goal $${GOAL_TARGET_DOUBLE})`);
                cy.task(
                    'log',
                    chips >= GOAL_TARGET_DOUBLE
                        ? `Goal hit: $${chips}`
                        : `Short of $${GOAL_TARGET_DOUBLE} — variance; re-run`,
                );
            });

        cy.get('[data-testid="player-chips"]').should(($el) => {
            const chips = Number.parseInt($el.text().replace(/[^\d]/g, ''), 10);
            expect(chips, 'bankroll doubled to $2000').to.be.at.least(GOAL_TARGET_DOUBLE);
        });
    });
});
