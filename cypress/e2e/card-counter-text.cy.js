import {
    GOAL_START,
    GOAL_TARGET,
    GOAL_TARGET_DOUBLE,
    MAX_ROUNDS_DOUBLE,
} from '../support/commands';

const TEXT_PATH = '/?mode=text';

describe('Card counter — text mode', () => {
    beforeEach(() => {
        cy.visit(TEXT_PATH);
        cy.get('[data-testid="counter-text-board"]').should('exist');
        cy.get('[data-testid="table-ready"]').should('exist');
        cy.getBlackjack();
    });

    it('plays Hi-Lo with full stats visible (PoC $1075 goal)', () => {
        cy.prepareCounterShoe(1);
        cy.get('[data-testid="true-count"]').should('exist');
        cy.get('[data-testid="suggested-bet"]').should('exist');
        cy.get('[data-testid="player-chips"]').should('contain', `$${GOAL_START}`);

        cy.playCounterSession({ goal: GOAL_TARGET });

        cy.get('[data-testid="player-chips"]').should(($el) => {
            const chips = Number.parseInt($el.text().replace(/[^\d]/g, ''), 10);
            expect(chips, 'bankroll reached $1075 goal').to.be.at.least(GOAL_TARGET);
        });
    });

    it('plays until $2000 or max rounds (text mode, no WebGL)', () => {
        cy.prepareCounterShoe(1);

        cy.playCounterSession({
            goal: GOAL_TARGET_DOUBLE,
            maxRounds: MAX_ROUNDS_DOUBLE,
        });

        cy.get('[data-testid="player-chips"]')
            .invoke('text')
            .then((text) => {
                const chips = Number.parseInt(text.replace(/[^\d]/g, ''), 10);
                cy.task('log', `\n=== Text mode $2000 run complete ===`);
                cy.task('log', `Final bankroll: $${chips} (goal $${GOAL_TARGET_DOUBLE})`);
            });
    });
});
