import { useGameContext } from '../../context';
import { getStatusMessage } from '../../utils/handStatusMessage';
import HandTotals from './HandTotals';

/**
 * Round status + hand totals overlaid on the felt.
 * Camera reserves safe bands so dealer/player stay clear of this chrome.
 * AI id is not repeated here — status copy already names the AI when active.
 */
function TopGameStats({ compact = false, showReset = false }) {
    const {
        playerHands,
        activeHandIndex,
        gameState,
        winner,
        aiPlayerEnabled,
        resetGame,
    } = useGameContext();

    const status = getStatusMessage({
        gameState,
        winner,
        aiPlayerEnabled,
        activeHandIndex,
        playerHands,
    });

    return (
        <div className="flex items-start gap-2" data-testid="top-game-stats">
            <div className="min-w-0 flex-1 text-center">
                <p
                    className={`font-semibold leading-snug tracking-wide text-white ${
                        compact ? 'text-[11px] sm:text-base' : 'text-sm sm:text-base'
                    }`}
                >
                    {status}
                </p>
                <HandTotals compact={compact} />
            </div>
            {showReset && (
                <button
                    type="button"
                    data-testid="reset-game-mobile"
                    onClick={resetGame}
                    className="shrink-0 rounded-md border border-white/15 bg-black/60 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wide text-white/55"
                >
                    Reset
                </button>
            )}
        </div>
    );
}

export default TopGameStats;
