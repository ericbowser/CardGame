export function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

export function buildShoe(singleDeck, deckCount) {
    const shoe = [];

    for (let i = 0; i < deckCount; i += 1) {
        shoe.push(...singleDeck);
    }

    return shoe;
}
