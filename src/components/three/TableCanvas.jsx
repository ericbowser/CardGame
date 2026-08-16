import { memo, useCallback, useState } from 'react';
import { useTableSceneState } from '../../hooks/useTableSceneState';
import TableBusyOverlay from '../game/TableBusyOverlay';
import BlackjackScene from './BlackjackScene';

/** Isolated 3D host — skips renders unless table-visual context changes. */
function TableCanvas() {
    const {
        playerHands,
        dealerCards,
        showHoleCard,
        cardsRemaining,
        totalCardsInShoe,
        isDeckShuffled,
        boardBusy,
        boardBusyMessage,
    } = useTableSceneState();

    const [sceneReady, setSceneReady] = useState(false);
    const handleSceneReady = useCallback(() => setSceneReady(true), []);

    const showOverlay = !sceneReady || boardBusy;
    const overlayMessage = !sceneReady
        ? 'Loading table…'
        : boardBusyMessage || 'Updating table…';

    return (
        <div className="relative h-full min-h-0 w-full">
            <BlackjackScene
                playerHands={playerHands}
                dealerCards={dealerCards}
                showHoleCard={showHoleCard}
                cardsRemaining={cardsRemaining}
                totalCardsInShoe={totalCardsInShoe}
                isDeckShuffled={isDeckShuffled}
                onSceneReady={handleSceneReady}
            />
            {showOverlay && <TableBusyOverlay message={overlayMessage} />}
        </div>
    );
}

export default memo(TableCanvas);
