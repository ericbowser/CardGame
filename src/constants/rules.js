/** Standard Vegas-style table rules (matches EV panel assumptions). */
export const TABLE_RULES = {
    /** Only matching ranks (8+8), not mixed 10-value cards. */
    splitSameRankOnly: true,
    /** MVP: one split → two hands max. */
    maxHands: 2,
    /** One card per split ace, then auto-stand. */
    splitAcesOneCard: true,
    /** 21 after splitting aces pays 1:1, not 3:2. */
    splitAceBlackjackPaysEven: true,
    dealerStandsOn: 17,
};

export const HandStatus = {
    Playing: 'playing',
    Stand: 'stand',
    Bust: 'bust',
};
