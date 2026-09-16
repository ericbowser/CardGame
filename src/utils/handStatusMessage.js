import { GameState, Who } from '../constants/game';
import { AI_PLAYER_ID } from '../constants/aiPlayer';

/** Round-phase headline shown above dealer/player totals. */
export function getStatusMessage({
    gameState,
    winner,
    aiPlayerEnabled,
    activeHandIndex,
    playerHands,
}) {
    if (!gameState) {
        return 'Ready to play';
    }

    switch (gameState) {
        case GameState.DeckShuffled:
            return 'Deck shuffled — place your bet';
        case GameState.CardsDealt:
            return 'Dealing cards...';
        case GameState.PlayerPhase:
            return aiPlayerEnabled
                ? `${AI_PLAYER_ID} playing hand ${activeHandIndex + 1}…`
                : playerHands.length > 1
                  ? `Hand ${activeHandIndex + 1} — Hit, Stay, or Split?`
                  : 'Your turn — Hit, Stay, or Split?';
        case GameState.DealerPhase:
            return aiPlayerEnabled ? `${AI_PLAYER_ID} watching dealer…` : "Dealer's turn...";
        case GameState.GameConcluded:
            if (winner === 'Push') return "Push — it's a tie";
            if (winner === 'Mixed') return 'Split round complete';
            if (winner === Who.Player) return 'You win!';
            if (winner === Who.Dealer) return 'Dealer wins';
            return 'Round over';
        default:
            return '';
    }
}
