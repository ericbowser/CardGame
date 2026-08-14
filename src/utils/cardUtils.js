export function calculateHandValue(cards) {
    if (!cards || cards.length === 0) {
        return 0;
    }

    let total = 0;
    let aces = 0;

    cards.forEach((card) => {
        if (card.includes('ace')) {
            aces++;
        } else if (
            card.includes('king') ||
            card.includes('queen') ||
            card.includes('jack') ||
            card.includes('10')
        ) {
            total += 10;
        } else {
            const match = card.match(/(\d+)_of/);
            if (match?.[1]) {
                total += parseInt(match[1], 10);
            }
        }
    });

    for (let i = 0; i < aces; i++) {
        total += total + 11 <= 21 ? 11 : 1;
    }

    return total;
}
