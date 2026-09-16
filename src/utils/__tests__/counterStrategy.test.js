import { getBasicStrategyAction, getDealerUpcardBucket } from '../basicStrategy.js';

import {

    getCounterWager,

    getCounterGoal,

    shouldWongOut,

    spreadUnitsForTrueCount,

} from '../counterBetSpread.js';

import {

    calculateTrueCount,

    getBettingTrueCount,

    getSpreadTrueCount,

} from '../countingUtils.js';



describe('basicStrategy', () => {

    const ten = '/cards/10_of_spades.png';

    const six = '/cards/6_of_hearts.png';

    const ace = '/cards/ace_of_clubs.png';

    const eight = '/cards/8_of_diamonds.png';

    const two = '/cards/2_of_clubs.png';

    const three = '/cards/3_of_hearts.png';

    const five = '/cards/5_of_spades.png';

    const seven = '/cards/7_of_spades.png';



    test('hard 16 vs 10 stands at TC 0', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [ten, six],

                dealerUpcard: ten,

                canSplit: false,

                trueCount: 0,

            }),

        ).toBe('stand');

    });



    test('hard 16 vs 9 stands at TC 5', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [ten, six],

                dealerUpcard: '/cards/9_of_hearts.png',

                canSplit: false,

                trueCount: 5,

            }),

        ).toBe('stand');

    });



    test('pair of 8s splits vs 10', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [eight, '/cards/8_of_clubs.png'],

                dealerUpcard: ten,

                canSplit: true,

            }),

        ).toBe('split');

    });



    test('pair of 10s splits vs 6 at TC 4', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [ten, '/cards/10_of_clubs.png'],

                dealerUpcard: six,

                canSplit: true,

                trueCount: 4,

            }),

        ).toBe('split');

    });



    test('pair of 10s stands vs 6 at TC 3', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [ten, '/cards/10_of_hearts.png'],

                dealerUpcard: six,

                canSplit: true,

                trueCount: 3,

            }),

        ).toBe('stand');

    });



    test('pair of aces always splits', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [ace, '/cards/ace_of_hearts.png'],

                dealerUpcard: ten,

                canSplit: true,

            }),

        ).toBe('split');

    });



    test('pair of 2s splits vs dealer stiff 5', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [two, '/cards/2_of_hearts.png'],

                dealerUpcard: five,

                canSplit: true,

            }),

        ).toBe('split');

    });



    test('soft 18 vs 9 hits without double', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [ace, '/cards/7_of_spades.png'],

                dealerUpcard: '/cards/9_of_hearts.png',

                canSplit: false,

            }),

        ).toBe('hit');

    });



    test('hard 12 vs 3 stands at high TC (dealer bust lean)', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [two, ten],

                dealerUpcard: three,

                canSplit: false,

                trueCount: 2,

            }),

        ).toBe('stand');

    });



    test('hard 12 vs 4 hits at negative TC', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [two, ten],

                dealerUpcard: '/cards/4_of_hearts.png',

                canSplit: false,

                trueCount: -1,

            }),

        ).toBe('hit');

    });



    test('hard 13 vs dealer 6 stands (dealer bust territory)', () => {
        expect(
            getBasicStrategyAction({
                playerCards: [three, ten],
                dealerUpcard: six,
                canSplit: false,
            }),
        ).toBe('stand');
    });

    test('hard 13 vs 2 stands at neutral TC', () => {
        expect(
            getBasicStrategyAction({
                playerCards: [three, ten],
                dealerUpcard: two,
                canSplit: false,
                trueCount: 0,
            }),
        ).toBe('stand');
    });

    test('hard 12 vs 7 hits', () => {
        expect(
            getBasicStrategyAction({
                playerCards: [two, ten],
                dealerUpcard: seven,
                canSplit: false,
            }),
        ).toBe('hit');
    });

    test('soft 18 vs 8 stands', () => {
        expect(
            getBasicStrategyAction({
                playerCards: [ace, seven],
                dealerUpcard: eight,
                canSplit: false,
            }),
        ).toBe('stand');
    });

    test('pair of 2s hits vs 10 (does not split)', () => {
        expect(
            getBasicStrategyAction({
                playerCards: [two, '/cards/2_of_hearts.png'],
                dealerUpcard: ten,
                canSplit: true,
            }),
        ).toBe('hit');
    });

    test('pair of 9s stands vs 10', () => {
        expect(
            getBasicStrategyAction({
                playerCards: ['/cards/9_of_clubs.png', '/cards/9_of_hearts.png'],
                dealerUpcard: ten,
                canSplit: true,
            }),
        ).toBe('stand');
    });

    test('12 vs 4 hits at TC 0 (Illustrious index)', () => {
        expect(
            getBasicStrategyAction({
                playerCards: [two, ten],
                dealerUpcard: '/cards/4_of_hearts.png',
                canSplit: false,
                trueCount: 0,
            }),
        ).toBe('hit');
    });

    test('11 vs ace hits at TC +1 (Illustrious 18 double → hit)', () => {
        expect(

            getBasicStrategyAction({

                playerCards: [five, six],

                dealerUpcard: ace,

                canSplit: false,

                trueCount: 1,

            }),

        ).toBe('hit');

    });



    test('9 vs 7 hits at TC +3 (Illustrious 18 double → hit)', () => {

        expect(

            getBasicStrategyAction({

                playerCards: [two, seven],

                dealerUpcard: seven,

                canSplit: false,

                trueCount: 3,

            }),

        ).toBe('hit');

    });



    test('dealer upcard buckets', () => {

        expect(getDealerUpcardBucket('/cards/king_of_spades.png')).toBe(10);

        expect(getDealerUpcardBucket(ace)).toBe('A');

    });

});



describe('countingUtils', () => {

    test('rounds decks remaining to nearest half-deck', () => {
        // 40/52 ≈ 0.77 → 1.0 half-deck step (not floored to 0.5)
        expect(calculateTrueCount(6, 40, 52)).toBe(6);
        expect(getSpreadTrueCount(6, 40, 52)).toBe(6);
    });

    test('betting true count uses half-deck estimate', () => {
        // 30/52 ≈ 0.58 → 0.5 decks; RC 4 → TC 8
        expect(getBettingTrueCount(4, 30, 52)).toBe(8);
    });

});



describe('counterBetSpread', () => {

    test('spread ramps from small negative bets to max press', () => {
        expect(spreadUnitsForTrueCount(-1)).toBe(1);
        expect(spreadUnitsForTrueCount(0)).toBe(2);
        expect(spreadUnitsForTrueCount(1)).toBe(3);
        expect(spreadUnitsForTrueCount(2)).toBe(8);
        expect(spreadUnitsForTrueCount(3)).toBe(15);
        expect(spreadUnitsForTrueCount(4)).toBe(25);
        expect(spreadUnitsForTrueCount(5)).toBe(35);
        expect(spreadUnitsForTrueCount(10)).toBe(40);
    });

    test('wager amounts follow count quality', () => {
        // Poor / flat shoes — keep risk small
        expect(getCounterWager(-1, 1000, 52, -1)).toBe(5);
        expect(getCounterWager(0, 1000, 52, 0)).toBe(10);
        expect(getCounterWager(1.2, 1000, 52, 1)).toBe(15);
        // Hot shoes — press hard
        expect(getCounterWager(2.2, 1000, 52, 2)).toBe(40);
        expect(getCounterWager(3.5, 1000, 52, 3)).toBe(75);
        expect(getCounterWager(4.1, 1000, 52, 4)).toBe(125);
        expect(getCounterWager(5.2, 1000, 52, 5)).toBe(175);
        expect(getCounterWager(6.5, 1000, 52, 6)).toBe(200);
    });

    test('never exceeds available chips', () => {
        expect(getCounterWager(6, 30, 52, 6)).toBe(5);
        expect(getCounterWager(6, 12, 52, 6)).toBe(5);
    });

    test('caps big bets relative to bankroll', () => {
        // Pass null RC so trueCount drives the tier (not shoe-adjusted spread TC).
        // TC5 → 20% of $139 = $27 → floored to unit $25 (units want $175)
        expect(getCounterWager(5, 139, 40, null)).toBe(25);
        // TC6 → 25% of $559 = $139 → floored after ceil clamp → $135
        expect(getCounterWager(6, 559, 30, null)).toBe(135);
    });

    test('wongs out on deeply negative counts', () => {
        expect(getCounterWager(-2, 1000, 52, -3)).toBe(0);
        expect(shouldWongOut(-3, 52, 52)).toBe(true);
        expect(shouldWongOut(-2, 20, 52)).toBe(true);
    });

    test('stays small when count is flat or mildly negative (not wonging)', () => {
        expect(getCounterWager(-1, 1000, 52, -1)).toBe(5);
        expect(getCounterWager(0, 1000, 52, 0)).toBe(10);
    });

    test('goal is $1075 from $1000 start', () => {
        expect(getCounterGoal(1000)).toBe(1075);
    });

});

