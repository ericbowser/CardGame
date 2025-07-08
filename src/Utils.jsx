export const FaceValues = [
    {1: 'ace_as_one'},
    {11: 'ace_as_eleven'},
    {10: "10"},
    {10: 'jack'},
    {10: 'queen'},
    {10: 'king'}
];

export const SmallValues = [1,2,3,4,5,6,7,8,9];

export const Who = {
    Dealer: "Dealer",
    Player: "Player"
}

export const Action = {
    Hit: "Hit",
    Stay: "Stay"
}

export const GameState = {
    Ready: "Ready",
    Betting: "Betting",
    CardsDealt: "CardsDealt",
    PlayerTurn: "PlayerTurn",
    PlayerBusted: "PlayerBusted",
    DealerTurn: "DealerTurn",
    RoundOver: "RoundOver"
};

export const calculateHandValue = (hand) => {
    if (!hand || hand.length === 0) {
        return 0;
    }

    let value = 0;
    let aceCount = 0;

    // First, sum up all card values and count the Aces
    for (const card of hand) {
        value += card.value;
        if (card.rank === 'A') {
            aceCount++;
        }
    }

    // Now, adjust for Aces if the total value is over 21
    // This loop will convert an Ace's value from 11 to 1 if needed.
    while (value > 21 && aceCount > 0) {
        value -= 10; // Equivalent to changing an Ace from 11 to 1
        aceCount--;
    }

    return value;
};
