import { useGameContext } from '../../context';
import { calculateHandValue } from '../../utils/cardUtils';

/** Dealer / player hand value chips used in the top game stats bar. */
function HandTotals({ visible = true, compact = false }) {
    const {
        playerHands,
        dealerCards,
        playerCountDisplay,
        dealerCount,
        showHoleCard,
        gameState,
    } = useGameContext();

    const hasPlayerCards = playerHands.some((hand) => hand.cards.length > 0);
    const showCards = visible && gameState && (hasPlayerCards || dealerCards.length > 0);
    const dealerDisplay = showHoleCard
        ? dealerCount
        : dealerCards[0]
          ? `${calculateHandValue([dealerCards[0]])} + ?`
          : '?';

    return (
        <div
            className={`flex flex-wrap justify-center gap-1 ${
                compact ? 'mt-0.5 sm:mt-2' : 'mt-2'
            } ${showCards ? 'visible' : 'invisible'}`}
            data-testid="hand-totals"
        >
            <span
                className={`font-bold tabular-nums text-amber-100 ${
                    compact
                        ? 'rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] sm:rounded-lg sm:border sm:border-amber-400/25 sm:bg-amber-500/10 sm:px-2.5 sm:py-1 sm:text-sm'
                        : 'rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-xs sm:text-sm'
                }`}
            >
                Dealer: {dealerDisplay}
            </span>
            <span
                className={`font-bold tabular-nums text-emerald-100 ${
                    compact
                        ? 'rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] sm:rounded-lg sm:border sm:border-emerald-400/25 sm:bg-emerald-500/10 sm:px-2.5 sm:py-1 sm:text-sm'
                        : 'rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-xs sm:text-sm'
                }`}
            >
                Player: {playerCountDisplay || '—'}
            </span>
        </div>
    );
}

export default HandTotals;
