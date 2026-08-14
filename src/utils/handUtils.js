import { HandStatus, TABLE_RULES } from '../constants/rules';
import { calculateHandValue } from './cardUtils';

export function getCardRank(cardSrc) {
    if (!cardSrc) {
        return '';
    }
    const filename = cardSrc.split('/').pop() ?? cardSrc;
    const match = filename.match(/^([^_]+)_of_/);
    return match?.[1] ?? '';
}

export function createPlayerHand(cards, bet) {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        cards: [...cards],
        bet,
        status: HandStatus.Playing,
    };
}

export function isPairSplittable(cardA, cardB) {
    return getCardRank(cardA) === getCardRank(cardB);
}

export function canSplitHand(hand, allHands, chipsAvailable, rules = TABLE_RULES) {
    if (!hand || hand.status !== HandStatus.Playing) {
        return false;
    }
    if (allHands.length >= rules.maxHands) {
        return false;
    }
    if (hand.cards.length !== 2) {
        return false;
    }
    if (!isPairSplittable(hand.cards[0], hand.cards[1])) {
        return false;
    }
    if (hand.bet > chipsAvailable) {
        return false;
    }
    return true;
}

export function getHandValue(hand) {
    return calculateHandValue(hand?.cards ?? []);
}

export function isAcePair(hand) {
    return hand?.cards?.length === 2 && getCardRank(hand.cards[0]) === 'ace';
}

export function formatHandTotals(hands) {
    if (!hands?.length) {
        return '';
    }
    if (hands.length === 1) {
        return String(getHandValue(hands[0]));
    }
    return hands
        .map((hand, index) => {
            const value = getHandValue(hand);
            if (hand.status === HandStatus.Bust) {
                return `H${index + 1}: bust`;
            }
            return `H${index + 1}: ${value}`;
        })
        .join(' · ');
}
