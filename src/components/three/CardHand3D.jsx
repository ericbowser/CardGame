import { CARD_LIFT, CARD_WIDTH, PlayingCard3D } from './PlayingCard3D';
import { tableLayout } from './tableLayout';

/** Slight overlap for a natural fan; scales down when many cards. */
function handSpacing(cardCount) {
    const maxSpread = tableLayout.radius * 0.55;
    const ideal = CARD_WIDTH * 0.58;
    return Math.min(ideal, maxSpread / Math.max(cardCount, 1));
}

export function CardHand3D({
    cards,
    backSrc,
    zPosition,
    showHoleCard = true,
    holeCardIndex = -1,
    dealOffset = 0,
    handId = 'hand',
    xOffset = 0,
}) {
    if (!cards?.length) {
        return null;
    }

    const spacing = handSpacing(cards.length);
    const startX = -((cards.length - 1) * spacing) / 2;

    return cards.map((cardSrc, index) => {
        const x = startX + index * spacing + xOffset;
        const tilt = (index - (cards.length - 1) / 2) * 0.045;
        const isHoleCard = holeCardIndex >= 0 && index === holeCardIndex && !showHoleCard;
        const lift = tableLayout.topY + CARD_LIFT + index * 0.003;

        return (
            <PlayingCard3D
                key={`${handId}-${index}-${cardSrc}`}
                frontSrc={cardSrc}
                backSrc={backSrc}
                targetPosition={[x, lift, zPosition]}
                targetRotationZ={tilt}
                faceDown={isHoleCard}
                dealIndex={dealOffset + index}
                deckOrigin={tableLayout.deckPosition}
            />
        );
    });
}
