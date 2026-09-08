export function getCardRank(cardPath) {
    if (!cardPath) {
        return null;
    }

    const lower = cardPath.toLowerCase();

    if (lower.includes('ace')) {
        return 'A';
    }

    if (lower.includes('king')) {
        return 'K';
    }

    if (lower.includes('queen')) {
        return 'Q';
    }

    if (lower.includes('jack')) {
        return 'J';
    }

    const match = lower.match(/(\d+)_of/);
    if (match?.[1]) {
        return match[1];
    }

    return null;
}

export function getCardShortName(cardPath) {
    const rank = getCardRank(cardPath);
    if (!rank) {
        return 'Card';
    }

    const lower = cardPath.toLowerCase();
    let suit = '';

    if (lower.includes('spades')) {
        suit = '♠';
    } else if (lower.includes('hearts')) {
        suit = '♥';
    } else if (lower.includes('diamonds')) {
        suit = '♦';
    } else if (lower.includes('clubs')) {
        suit = '♣';
    }

    return `${rank}${suit}`;
}

/** Hi-Lo: 2-6 → +1, 7-9 → 0, 10-A → -1 */
export function getHiLoCount(cardPath) {
    const rank = getCardRank(cardPath);
    if (!rank) {
        return 0;
    }

    if (rank === 'A' || rank === 'K' || rank === 'Q' || rank === 'J' || rank === '10') {
        return -1;
    }

    const numericRank = parseInt(rank, 10);
    if (numericRank >= 2 && numericRank <= 6) {
        return 1;
    }

    return 0;
}

export function formatCountDelta(delta) {
    if (delta > 0) {
        return `+${delta}`;
    }

    if (delta < 0) {
        return `${delta}`;
    }

    return '0';
}

export function estimateDecksRemaining(cardsRemaining, deckSize = 52) {
    const exact = cardsRemaining / deckSize;
    // Round down to nearest half-deck — conservative for the player (raises TC)
    return Math.max(Math.floor(exact * 2) / 2, 0.5);
}

export function calculateTrueCount(runningCount, cardsRemaining, deckSize = 52) {
    const decksRemaining = estimateDecksRemaining(cardsRemaining, deckSize);
    return Math.round((runningCount / decksRemaining) * 10) / 10;
}

/** Integer-style TC used for bet-ramp thresholds (Schlesinger / TableSharp). */
export function getBettingTrueCount(runningCount, cardsRemaining, deckSize = 52) {
    const decksRemaining = estimateDecksRemaining(cardsRemaining, deckSize);
    return runningCount / decksRemaining;
}

/** Floor TC for spread lookup — counters size bets on conservative TC. */
export function getSpreadTrueCount(runningCount, cardsRemaining, deckSize = 52) {
    return Math.floor(getBettingTrueCount(runningCount, cardsRemaining, deckSize));
}

/**
 * Rule-of-thumb player edge for common rules (S17, DAS, 3:2 BJ):
 * edge% ≈ (trueCount - 1) × 0.5%
 */
export function estimatePlayerEvPercent(trueCount) {
    return Math.round((trueCount - 1) * 0.5 * 10) / 10;
}

export function estimateEvDollars(wager, evPercent) {
    if (wager <= 0) {
        return 0;
    }

    return Math.round(wager * (evPercent / 100) * 100) / 100;
}

export function formatEvPercent(evPercent) {
    if (evPercent > 0) {
        return `+${evPercent.toFixed(1)}%`;
    }

    return `${evPercent.toFixed(1)}%`;
}

export function getEvRecommendation(evPercent) {
    if (evPercent >= 1) {
        return 'Strong player advantage — counters often raise bets here.';
    }

    if (evPercent >= 0) {
        return 'Near break-even or slight player edge.';
    }

    if (evPercent >= -0.5) {
        return 'House still has a small edge.';
    }

    return 'House edge — flat or minimum bets are typical.';
}
