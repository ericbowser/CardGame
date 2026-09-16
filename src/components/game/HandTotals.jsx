import { useGameContext } from '../../context';
import { calculateHandValue } from '../../utils/cardUtils';

/** Dealer / player hand value chips used in the top game stats bar. */
function HandTotals({ visible = true }) {
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
            className={`mt-2 flex flex-wrap justify-center gap-1 ${
                showCards ? 'visible' : 'invisible'
            }`}
            data-testid="hand-totals"
        >
            <span className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-xs font-bold tabular-nums text-amber-100 sm:text-sm">
                Dealer: {dealerDisplay}
            </span>
            <span className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-100 sm:text-sm">
                Player: {playerCountDisplay || '—'}
            </span>
        </div>
    );
}

export default HandTotals;
