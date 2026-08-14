export const Who = {
    Dealer: 'Dealer',
    Player: 'Player',
};

export const Action = {
    Hit: 'Hit',
    Stay: 'Stay',
};

export const GameState = {
    DeckShuffled: 'Cards Shuffled',
    CardsDealt: 'Cards Dealt',
    PlayerPhase: 'Player Phase',
    DealerPhase: 'Dealer Phase',
    GameConcluded: 'Game Concluded',
};

export const DEFAULT_STARTING_CHIPS = 1000;
export const DEFAULT_BET = 25;
export const LOW_DECK_THRESHOLD = 20;
export const FULL_DECK_SIZE = 52;
export const DECK_COUNT_OPTIONS = [1, 6];
export const DEFAULT_DECK_COUNT = 1;

export function getLowDeckThreshold(deckCount) {
    return LOW_DECK_THRESHOLD * deckCount;
}

export function getShoeSize(deckCount) {
    return FULL_DECK_SIZE * deckCount;
}
