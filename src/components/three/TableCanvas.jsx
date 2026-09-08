import { memo, useCallback, useState } from 'react';
import { useTableSceneState } from '../../hooks/useTableSceneState';
import { isAutomationHost } from '../../e2e/e2ePacing';
import TableBusyOverlay from '../game/TableBusyOverlay';
import BlackjackScene from './BlackjackScene';

/** Isolated 3D host — skips renders unless table-visual context changes. */
function TableCanvas() {
    const {
        playerHands,
        dealerCards,
        showHoleCard,
        dealEpoch,
        cardsRemaining,
        totalCardsInShoe,
        isDeckShuffled,
        boardBusy,
        boardBusyMessage,
        aiPlayerEnabled,
    } = useTableSceneState();

    const [sceneReady, setSceneReady] = useState(false);
    const handleSceneReady = useCallback(() => setSceneReady(true), []);

    const automationHost = isAutomationHost();
    // AI watch needs to see cards deal — don't cover the table while busy.
    const showBlockingOverlay =
        !sceneReady || (!automationHost && !aiPlayerEnabled && boardBusy);
    const overlayMessage = !sceneReady
        ? 'Loading table…'
        : boardBusyMessage || 'Updating table…';

    return (
        <div
            className="relative h-full min-h-0 w-full"
            data-testid={sceneReady ? 'table-ready' : 'table-loading'}
        >
            <BlackjackScene
                playerHands={playerHands}
                dealerCards={dealerCards}
                showHoleCard={showHoleCard}
                dealEpoch={dealEpoch}
                cardsRemaining={cardsRemaining}
                totalCardsInShoe={totalCardsInShoe}
                isDeckShuffled={isDeckShuffled}
                onSceneReady={handleSceneReady}
            />
            {showBlockingOverlay && <TableBusyOverlay message={overlayMessage} />}
        </div>
    );
}

export default memo(TableCanvas);
