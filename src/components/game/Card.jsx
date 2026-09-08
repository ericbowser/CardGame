import { GameState, Who } from '../../constants/game';
import { AI_PLAYER_ID } from '../../constants/aiPlayer';
import { useGameContext } from '../../context';
import { calculateHandValue } from '../../utils/cardUtils';
import TableCanvas from '../three/TableCanvas';

function Card() {
    const {
        playerHands,
        activeHandIndex,
        dealerCards,
        playerCountDisplay,
        dealerCount,
        showHoleCard,
        gameState,
        winner,
        roundOver,
        betAmount,
        playerChips,
        isDeckShuffled,
        shuffleDeck,
        playerHit,
        playerStay,
        playerSplit,
        canSplit,
        quickDeal,
        boardBusy,
        aiPlayerEnabled,
        resetGame,
    } = useGameContext();

    const getGameStatusMessage = () => {
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
    };

    const canPlayerAct = gameState === GameState.PlayerPhase;
    const isGameOver = gameState === GameState.GameConcluded;
    const isDealerTurn = gameState === GameState.DealerPhase;
    const hasPlayerCards = playerHands.some((hand) => hand.cards.length > 0);
    const showCards = gameState && (hasPlayerCards || dealerCards.length > 0);
    const canDealAgain = roundOver && betAmount > 0 && betAmount <= playerChips;
    const showActionBar = isDeckShuffled && (canPlayerAct || isGameOver || isDealerTurn);

    const dealerDisplay = showHoleCard
        ? dealerCount
        : dealerCards[0]
            ? `${calculateHandValue([dealerCards[0]])} + ?`
            : '?';

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <div className="pointer-events-none absolute left-3 top-3 z-30 hidden sm:block sm:left-4 sm:top-4">
                <h1 className="text-lg font-bold tracking-[0.12em] text-amber-300/90 sm:text-2xl sm:tracking-[0.15em] lg:text-3xl">
                    BLACKJACK
                </h1>
                {aiPlayerEnabled && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-950/80 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-cyan-200 sm:text-xs">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                        {AI_PLAYER_ID}
                    </div>
                )}
            </div>

            <button
                type="button"
                data-testid="reset-game"
                onClick={resetGame}
                className="absolute right-2 top-2 z-30 rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/45 backdrop-blur-sm transition hover:border-white/25 hover:bg-black/70 hover:text-white/80 sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-xs"
            >
                Reset
            </button>

            {isDeckShuffled && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-1 sm:px-4 sm:pt-3 lg:px-6 lg:pt-4">
                    <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-b-xl border-x border-b border-white/15 bg-black/70 px-2 py-1 text-center backdrop-blur-md sm:flex-col sm:rounded-xl sm:border sm:px-5 sm:py-3">
                        <p className="text-[11px] font-semibold tracking-wide text-white sm:text-base lg:text-lg">
                            {getGameStatusMessage()}
                        </p>
                        {aiPlayerEnabled && (
                            <span className="font-mono text-[10px] font-bold tracking-wide text-cyan-300 sm:hidden">
                                {AI_PLAYER_ID}
                            </span>
                        )}
                        <div
                            className={`flex flex-wrap justify-center gap-1 text-[11px] sm:mt-2 sm:gap-4 sm:text-sm lg:text-base ${
                                showCards ? 'visible' : 'invisible'
                            }`}
                        >
                            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-bold text-amber-100 sm:rounded-lg sm:px-3 sm:py-1">
                                Dealer: {dealerDisplay}
                            </span>
                            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-bold text-emerald-100 sm:rounded-lg sm:px-3 sm:py-1">
                                Player: {playerCountDisplay || '—'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative min-h-0 flex-1 overflow-hidden bg-[#060606]" data-testid="table-canvas">
                <div className="absolute inset-0">
                    <TableCanvas />
                </div>
            </div>

            {!isDeckShuffled && (
                <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/80 px-4 py-3 text-center backdrop-blur-md sm:static sm:py-4">
                    <p className="mb-1 text-lg font-bold text-white">Welcome to the table</p>
                    <p className="mb-3 text-sm text-white/70">
                        Choose 1 or 6 decks in Game Controls, then shuffle to start
                    </p>
                    <button
                        type="button"
                        className="rounded-xl bg-amber-500 px-6 py-2 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-40"
                        disabled={boardBusy}
                        onClick={shuffleDeck}
                    >
                        Shuffle Deck
                    </button>
                </div>
            )}

            {isDeckShuffled && (
                <div
                    className={`pointer-events-auto z-20 border-t border-white/15 bg-black/90 p-2 backdrop-blur-md sm:p-4 ${
                        showActionBar
                            ? 'absolute inset-x-0 bottom-0 sm:static'
                            : 'invisible hidden min-h-[3.75rem] sm:block sm:min-h-[4.5rem]'
                    }`}
                >
                    {canPlayerAct && !aiPlayerEnabled && (
                        <div className="mx-auto flex w-full max-w-xl justify-center gap-1.5 sm:gap-3">
                            <button
                                type="button"
                                data-testid="hit"
                                disabled={boardBusy}
                                className="min-w-0 flex-1 rounded-xl bg-white/15 px-2 py-2.5 text-sm font-bold text-white transition hover:bg-white/25 disabled:opacity-40 sm:min-w-[5.5rem] sm:px-4 sm:py-3 sm:text-lg"
                                onClick={playerHit}
                            >
                                Hit
                            </button>
                            <button
                                type="button"
                                data-testid="stand"
                                disabled={boardBusy}
                                className="min-w-0 flex-1 rounded-xl bg-amber-500 px-2 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-40 sm:min-w-[5.5rem] sm:px-4 sm:py-3 sm:text-lg"
                                onClick={playerStay}
                            >
                                Stay
                            </button>
                            <button
                                type="button"
                                data-testid="split"
                                disabled={!canSplit || boardBusy}
                                className="min-w-0 flex-1 rounded-xl bg-violet-600 px-2 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[5.5rem] sm:px-4 sm:py-3 sm:text-lg"
                                onClick={playerSplit}
                            >
                                Split
                            </button>
                        </div>
                    )}

                    {isGameOver && !aiPlayerEnabled && (
                        <div className="mx-auto flex w-full max-w-lg flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <p className="text-center text-sm text-white/80 sm:text-left">
                                Round finished — place a new bet to continue.
                            </p>
                            {canDealAgain && (
                                <button
                                    type="button"
                                    data-testid="deal-again"
                                    disabled={boardBusy}
                                    onClick={quickDeal}
                                    className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-40"
                                >
                                    Deal Again (${betAmount})
                                </button>
                            )}
                        </div>
                    )}

                    {isDealerTurn && (
                        <div className="mx-auto flex max-w-lg items-center justify-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-amber-300" />
                            <span className="font-semibold text-white">Dealer thinking...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Card;
