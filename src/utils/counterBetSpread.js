import { DEFAULT_STARTING_CHIPS } from '../constants/game';
import {
    estimatePlayerEvPercent,
    getBettingTrueCount,
    getSpreadTrueCount,
} from './countingUtils';
import { getBasicStrategyAction } from './basicStrategy';

/** Chip buttons available in the betting UI. */
export const BET_DENOMINATIONS = [5, 25, 50, 100];

/** PoC session goal (~7.5% climb from $1000). */
export const COUNTER_GOAL_CHIPS = 1075;

/** Extended E2E goal — double the starting bankroll. */
export const COUNTER_GOAL_DOUBLE = 2000;

const MIN_UNIT = 5;
const MAX_SPREAD_UNITS = 12;

/**
 * Classic 1-12 unit ramp (TableSharp / Don Schlesinger).
 * Flat at TC ≤ +1, then convex ramp once the shoe favors the player.
 *
 * @see https://tablesharp.com/blog/hi-lo-card-counting-tutorial
 */
export function spreadUnitsForTrueCount(spreadTc) {
    if (spreadTc <= 1) {
        return 1;
    }
    if (spreadTc === 2) {
        return 2;
    }
    if (spreadTc === 3) {
        return 4;
    }
    if (spreadTc === 4) {
        return 8;
    }
    return MAX_SPREAD_UNITS;
}

/** Kelly-style bankroll cap by spread TC tier. */
function riskFractionForSpreadTc(spreadTc) {
    if (spreadTc <= 1) {
        return 0.01;
    }
    if (spreadTc === 2) {
        return 0.04;
    }
    if (spreadTc === 3) {
        return 0.06;
    }
    if (spreadTc === 4) {
        return 0.08;
    }
    return 0.1;
}

/**
 * Wong out: skip betting when the count is deeply negative late in the shoe.
 * Returns true when the counter should not play this round.
 */
export function shouldWongOut(runningCount, cardsRemaining, deckSize = 52) {
    const bettingTc = getBettingTrueCount(runningCount, cardsRemaining, deckSize);

    if (bettingTc <= -2) {
        return true;
    }

    // Wong: sit out deeply negative counts late in the shoe
    if (bettingTc <= -1 && cardsRemaining <= deckSize * 0.5) {
        return true;
    }

    return false;
}

function roundToUnit(amount, roundUp) {
    if (roundUp) {
        return Math.ceil(amount / MIN_UNIT) * MIN_UNIT;
    }
    return Math.floor(amount / MIN_UNIT) * MIN_UNIT;
}

function resolveSpreadTc(trueCount, runningCount, cardsRemaining, deckSize) {
    if (runningCount != null && Number.isFinite(runningCount)) {
        return getSpreadTrueCount(runningCount, cardsRemaining, deckSize);
    }
    return Math.floor(trueCount ?? 0);
}

/**
 * Bet spread driven by true count (S17, 3:2, DAS).
 * Uses the standard 1-12 unit ramp with bankroll Kelly caps.
 */
export function getAiCounterWager(
    trueCount,
    chipsAvailable = DEFAULT_STARTING_CHIPS,
    cardsRemaining = 52,
    runningCount = null,
    deckSize = 52,
) {
    if (chipsAvailable < MIN_UNIT) {
        return 0;
    }

    if (
        runningCount != null &&
        shouldWongOut(runningCount, cardsRemaining, deckSize)
    ) {
        return 0;
    }

    const spreadTc = resolveSpreadTc(trueCount, runningCount, cardsRemaining, deckSize);
    const units = spreadUnitsForTrueCount(spreadTc);
    let target = units * MIN_UNIT;

    const riskCap = Math.max(
        MIN_UNIT,
        Math.floor(chipsAvailable * riskFractionForSpreadTc(spreadTc)),
    );
    target = Math.min(target, riskCap, chipsAvailable);

    if (spreadTc >= 2) {
        target = roundToUnit(target, true);
    } else {
        target = MIN_UNIT;
    }

    target = Math.min(Math.max(target, MIN_UNIT), riskCap, chipsAvailable);

    return target >= MIN_UNIT ? target : 0;
}

/** @deprecated alias — same as getAiCounterWager */
export function getCounterWager(
    trueCount,
    chipsAvailable,
    cardsRemaining,
    runningCount = null,
    deckSize = 52,
) {
    return getAiCounterWager(
        trueCount,
        chipsAvailable,
        cardsRemaining,
        runningCount,
        deckSize,
    );
}

export function getCounterGoal(startingChips = DEFAULT_STARTING_CHIPS) {
    if (startingChips === DEFAULT_STARTING_CHIPS) {
        return COUNTER_GOAL_CHIPS;
    }
    return Math.round(startingChips * 1.075);
}

export function describeAiBet(
    trueCount,
    chipsAvailable,
    cardsRemaining,
    runningCount = null,
) {
    const spreadTc = resolveSpreadTc(trueCount, runningCount, cardsRemaining);
    const wager = getAiCounterWager(
        trueCount,
        chipsAvailable,
        cardsRemaining,
        runningCount,
    );
    const evPercent = estimatePlayerEvPercent(trueCount);
    const tcLabel = trueCount > 0 ? `+${trueCount}` : `${trueCount}`;
    const evLabel = evPercent > 0 ? `+${evPercent.toFixed(1)}%` : `${evPercent.toFixed(1)}%`;

    if (wager === 0 && runningCount != null && shouldWongOut(runningCount, cardsRemaining)) {
        return {
            wager: 0,
            evPercent,
            label: `Wong out · TC ${tcLabel} · EV ${evLabel}`,
        };
    }

    return {
        wager,
        evPercent,
        label: `$${wager} · TC ${tcLabel} (spread ${spreadTc}) · EV ${evLabel}`,
    };
}

export function resolveAiPlayAction({ playerCards, dealerUpcard, canSplit, trueCount = 0 }) {
    return getBasicStrategyAction({ playerCards, dealerUpcard, canSplit, trueCount });
}
