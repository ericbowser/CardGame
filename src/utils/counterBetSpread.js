import { DEFAULT_STARTING_CHIPS } from '../constants/game';
import {
    estimatePlayerEvPercent,
    getBettingTrueCount,
    getSpreadTrueCount,
} from './countingUtils';
import { getBasicStrategyAction } from './basicStrategy';

/** Chip buttons available in the betting UI. */
export const BET_DENOMINATIONS = [5, 10, 25, 50, 100];

/** PoC session goal (~7.5% climb from $1000). */
export const COUNTER_GOAL_CHIPS = 1075;

/** Extended E2E goal — double the starting bankroll. */
export const COUNTER_GOAL_DOUBLE = 2000;

const MIN_UNIT = 5;
/** Max units when the shoe is strongly +EV (TC ≥ +6). */
const MAX_SPREAD_UNITS = 40;

/**
 * Count-driven ramp: small bets in poor shoes, press hard when TC is hot.
 * Units × $5 → $5 / $10 / $15 / $40 / $75 / $125 / $175 / $200
 */
export function spreadUnitsForTrueCount(spreadTc) {
    if (spreadTc <= -1) {
        return 1; // $5 — survive negative shoes
    }
    if (spreadTc === 0) {
        return 2; // $10 — flat / house edge
    }
    if (spreadTc === 1) {
        return 3; // $15 — near break-even
    }
    if (spreadTc === 2) {
        return 8; // $40
    }
    if (spreadTc === 3) {
        return 15; // $75
    }
    if (spreadTc === 4) {
        return 25; // $125
    }
    if (spreadTc === 5) {
        return 35; // $175
    }
    return MAX_SPREAD_UNITS; // $200 at TC ≥ +6
}

/** Bankroll risk caps by spread TC — room for max bets when the count is rich. */
function riskFractionForSpreadTc(spreadTc) {
    if (spreadTc <= -1) {
        return 0.01;
    }
    if (spreadTc === 0) {
        return 0.02;
    }
    if (spreadTc === 1) {
        return 0.03;
    }
    if (spreadTc === 2) {
        return 0.06;
    }
    if (spreadTc === 3) {
        return 0.1;
    }
    if (spreadTc === 4) {
        return 0.15;
    }
    if (spreadTc === 5) {
        return 0.2;
    }
    return 0.25;
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
 * Bet spread driven by true count (S17, 3:2).
 * Low bets in −EV shoes; press bankroll when TC is strongly positive.
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

    // Always snap to chip units; round up only when pressing a +EV count.
    if (spreadTc >= 2) {
        target = roundToUnit(target, true);
        if (target > riskCap) {
            target = roundToUnit(riskCap, false);
        }
    } else {
        target = roundToUnit(Math.min(target, riskCap), false) || MIN_UNIT;
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
