import { calculateHandValue } from './cardUtils';
import { getCardRank } from './countingUtils';
import { isPairSplittable } from './handUtils';

/** Dealer upcard bucket: 2–9 or 10 (10/J/Q/K) or 'A'. */
export function getDealerUpcardBucket(cardPath) {
    const rank = getCardRank(cardPath);
    if (!rank) {
        return 10;
    }
    if (rank === 'A') {
        return 'A';
    }
    if (rank === 'K' || rank === 'Q' || rank === 'J' || rank === '10') {
        return 10;
    }
    return parseInt(rank, 10);
}

export function isDealerWeakUpcard(upcard) {
    const bucket = typeof upcard === 'string' && (upcard.includes('/') || upcard.includes('_'))
        ? getDealerUpcardBucket(upcard)
        : upcard;
    return typeof bucket === 'number' && bucket >= 2 && bucket <= 6;
}

function isSoftHand(cards) {
    if (!cards?.some((card) => card.toLowerCase().includes('ace'))) {
        return false;
    }
    const total = calculateHandValue(cards);
    return total <= 21 && total - 10 >= 2;
}

function getSoftTotal(cards) {
    return calculateHandValue(cards) - 10;
}

/** Columns: 2 3 4 5 6 7 8 9 10 A (10 chars). */
function dealerIndex(upcard) {
    if (upcard === 'A') {
        return 9;
    }
    return upcard - 2;
}

/**
 * S17, 3:2, DAS, no surrender, no double-down (hit when chart says double).
 */
const HARD = {
    8: 'HHHHHHHHHH',
    9: 'HHHSSSHHHH',
    10: 'HHHHHHHHHH',
    11: 'HHHHHHHHHH',
    12: 'HHSSSSHHHH',
    13: 'HSSSSSHHHH',
    14: 'HSSSSSHHHH',
    15: 'HSSSSSHHHH',
    16: 'HSSSSSHHHH',
    17: 'SSSSSSSSSS',
    18: 'SSSSSSSSSS',
    19: 'SSSSSSSSSS',
    20: 'SSSSSSSSSS',
    21: 'SSSSSSSSSS',
};

/** Soft totals as (hand total − 10): A2=2 … A9=9 */
const SOFT = {
    2: 'HHHHHHHHHH',
    3: 'HHHHHHHHHH',
    4: 'HHHHHHHHHH',
    5: 'HHHHHHHHHH',
    6: 'HHHHHHHHHH',
    7: 'HHHHHHHHHH',
    8: 'SSSSSSHHHH',
    9: 'SSSSSSSSSS',
};

/**
 * Always split Aces & 8s. Split small pairs vs dealer stiffs (2–7).
 * Never split 5s or 10s (except Illustrious 18 tens splits at high TC).
 */
const PAIRS = {
    2: 'PPPPPPHPPH',
    3: 'PPPPPPHPPH',
    4: 'HHHPPHHHHH',
    5: 'HHHHHHHHHH',
    6: 'PPPPPHHHHH',
    7: 'PPPPPPHHHH',
    8: 'PPPPPPPPPP',
    9: 'PPPSPSPHHH',
    10: 'SSSSSSSSSS',
    A: 'PPPPPPPPPP',
};

function chartAction(table, key, upcard) {
    const row = table[key];
    if (!row) {
        return 'stand';
    }
    const code = row[dealerIndex(upcard)] ?? 'H';
    return code === 'P' ? 'split' : code === 'S' ? 'stand' : 'hit';
}

function getPairRank(cards) {
    if (cards?.length !== 2) {
        return null;
    }
    const rankA = getCardRank(cards[0]);
    const rankB = getCardRank(cards[1]);
    if (rankA !== rankB) {
        return null;
    }
    if (rankA === 'A') {
        return 'A';
    }
    if (rankA === 'K' || rankA === 'Q' || rankA === 'J' || rankA === '10') {
        return 10;
    }
    return parseInt(rankA, 10);
}

/**
 * Illustrious 18 Hi-Lo deviations (S17, no surrender, no double — doubles map to hit).
 * @see https://blackjack3000.com/guides/illustrious-18.html
 */
function applyCountDeviations(baseAction, { total, soft, upcard, trueCount }) {
    const tc = trueCount ?? 0;

    // --- Positive indices (deviate at or above) ---

    // 16 vs 10: stand at TC ≥ 0
    if (!soft && total === 16 && upcard === 10 && tc >= 0) {
        return 'stand';
    }
    // 15 vs 10: stand at TC ≥ +4
    if (!soft && total === 15 && upcard === 10 && tc >= 4) {
        return 'stand';
    }
    // 16 vs 9: stand at TC ≥ +5
    if (!soft && total === 16 && upcard === 9 && tc >= 5) {
        return 'stand';
    }
    // 12 vs 3: stand at TC ≥ +2
    if (!soft && total === 12 && upcard === 3 && tc >= 2) {
        return 'stand';
    }
    // 12 vs 2: stand at TC ≥ +3
    if (!soft && total === 12 && upcard === 2 && tc >= 3) {
        return 'stand';
    }

    // Double deviations → hit (no double-down in this game)
    if (!soft && total === 10 && upcard === 10 && tc >= 4) {
        return 'hit';
    }
    if (!soft && total === 11 && upcard === 'A' && tc >= 1) {
        return 'hit';
    }
    if (!soft && total === 9 && upcard === 2 && tc >= 1) {
        return 'hit';
    }
    if (!soft && total === 10 && upcard === 'A' && tc >= 4) {
        return 'hit';
    }
    if (!soft && total === 9 && upcard === 7 && tc >= 3) {
        return 'hit';
    }

    // --- Negative indices (deviate below threshold) ---

    // 13 vs 2: hit below TC −1
    if (!soft && total === 13 && upcard === 2 && tc <= -1) {
        return 'hit';
    }
    // 12 vs 4: hit below TC 0
    if (!soft && total === 12 && upcard === 4 && tc < 0) {
        return 'hit';
    }
    // 12 vs 5: hit below TC −2
    if (!soft && total === 12 && upcard === 5 && tc <= -2) {
        return 'hit';
    }
    // 12 vs 6: hit below TC −1 (S17)
    if (!soft && total === 12 && upcard === 6 && tc <= -1) {
        return 'hit';
    }
    // 13 vs 3: hit below TC −2
    if (!soft && total === 13 && upcard === 3 && tc <= -2) {
        return 'hit';
    }

    return baseAction;
}

function resolvePairAction(pairRank, upcard, canSplit, playerCards, trueCount) {
    if (!canSplit || pairRank === null || !isPairSplittable(playerCards[0], playerCards[1])) {
        return null;
    }

    const pairAction = chartAction(PAIRS, pairRank, upcard);
    if (pairAction === 'split') {
        return 'split';
    }

    // Illustrious 18: split tens vs 5/6 at high counts
    if (pairRank === 10) {
        if (upcard === 5 && trueCount >= 5) {
            return 'split';
        }
        if (upcard === 6 && trueCount >= 4) {
            return 'split';
        }
        return 'stand';
    }

    return pairAction === 'stand' ? 'stand' : 'hit';
}

/**
 * @returns {'hit'|'stand'|'split'}
 */
export function getBasicStrategyAction({
    playerCards,
    dealerUpcard,
    canSplit = false,
    trueCount = 0,
}) {
    if (!playerCards?.length || !dealerUpcard) {
        return 'stand';
    }

    const upcard = getDealerUpcardBucket(dealerUpcard);
    const pairRank = getPairRank(playerCards);

    const pairResult = resolvePairAction(
        pairRank,
        upcard,
        canSplit,
        playerCards,
        trueCount ?? 0,
    );
    if (pairResult !== null) {
        return pairResult;
    }

    const soft = isSoftHand(playerCards);
    let action;

    if (soft) {
        const softKey = Math.min(getSoftTotal(playerCards), 9);
        action = chartAction(SOFT, softKey, upcard);
    } else {
        const total = calculateHandValue(playerCards);
        const hardKey = Math.min(Math.max(total, 8), 21);
        action = chartAction(HARD, hardKey, upcard);
    }

    const total = calculateHandValue(playerCards);
    return applyCountDeviations(action, { total, soft, upcard, trueCount });
}
