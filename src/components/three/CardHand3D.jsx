import { CARD_LIFT, PlayingCard3D } from './PlayingCard3D';

const CARD_SPACING = 0.42;

export function CardHand3D({
    cards,
    backSrc,
    zPosition,
    showHoleCard = true,
    holeCardIndex = -1,
    dealOffset = 0,
    handId = 'hand',
}) {
    if (!cards?.length) {
        return null;
    }

    const startX = -((cards.length - 1) * CARD_SPACING) / 2;

    return cards.map((cardSrc, index) => {
        const x = startX + index * CARD_SPACING;
        const tilt = (index - (cards.length - 1) / 2) * 0.045;
        const isHoleCard = holeCardIndex >= 0 && index === holeCardIndex && !showHoleCard;
        const lift = CARD_LIFT + index * 0.003;

        return (
            <PlayingCard3D
                key={`${handId}-${index}-${cardSrc}`}
                frontSrc={cardSrc}
                backSrc={backSrc}
                targetPosition={[x, lift, zPosition]}
                targetRotationZ={tilt}
                faceDown={isHoleCard}
                dealIndex={dealOffset + index}
            />
        );
    });
}
