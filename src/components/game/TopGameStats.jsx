import { AI_PLAYER_ID } from '../../constants/aiPlayer';
import { useGameContext } from '../../context';
import { getStatusMessage } from '../../utils/handStatusMessage';
import HandTotals from './HandTotals';

/**
 * Round status + hand totals overlaid on the felt.
 * Camera reserves safe bands so dealer/player stay clear of this chrome.
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
                {aiPlayerEnabled && (
                    <span className="mt-0.5 inline-block font-mono text-[10px] font-bold tracking-wide text-cyan-300 sm:hidden">
                        {AI_PLAYER_ID}
                    </span>
                )}
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
