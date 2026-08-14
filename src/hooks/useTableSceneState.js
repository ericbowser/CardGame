import { useMemo } from 'react';
import { useGameContext } from '../context';

/** Narrow context slice so the 3D table only re-renders when table visuals change. */
export function useTableSceneState() {
    const {
        playerHands,
        dealerCards,
        showHoleCard,
        cardsRemaining,
        totalCardsInShoe,
        isDeckShuffled,
    } = useGameContext();

    return useMemo(
        () => ({
            playerHands,
            dealerCards,
            showHoleCard,
            cardsRemaining,
            totalCardsInShoe,
            isDeckShuffled,
        }),
        [playerHands, dealerCards, showHoleCard, cardsRemaining, totalCardsInShoe, isDeckShuffled],
    );
}
