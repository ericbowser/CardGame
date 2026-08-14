import { memo } from 'react';
import { GameState, Who } from '../../constants/game';
import { useGameContext } from '../../context';
import { useTableSceneState } from '../../hooks/useTableSceneState';
import { calculateHandValue } from '../../utils/cardUtils';
import BlackjackScene from '../three/BlackjackScene';

const MemoBlackjackScene = memo(BlackjackScene);

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
    } = useGameContext();

    const tableSceneState = useTableSceneState();

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
                return playerHands.length > 1
                    ? `Hand ${activeHandIndex + 1} — Hit, Stay, or Split?`
                    : 'Your turn — Hit, Stay, or Split?';
            case GameState.DealerPhase:
                return "Dealer's turn...";
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
            <div className="pointer-events-none absolute left-3 top-3 z-30 sm:left-4 sm:top-4">
                <h1 className="text-lg font-bold tracking-[0.12em] text-amber-300/90 sm:text-2xl sm:tracking-[0.15em] lg:text-3xl">
                    BLACKJACK
                </h1>
            </div>

            <div
                className={`pointer-events-none shrink-0 px-3 sm:px-4 lg:px-6 ${
                    isDeckShuffled
                        ? 'pb-1.5 pt-10 sm:pb-2 sm:pt-12 lg:pt-14'
                        : 'min-h-0 p-0'
                }`}
            >
                {isDeckShuffled && (
                    <div className="mx-auto max-w-xl rounded-xl border border-white/15 bg-black/55 px-3 py-1.5 text-center backdrop-blur-md sm:px-5 sm:py-3">
                        <p className="text-sm font-semibold tracking-wide text-white sm:text-base lg:text-lg">
                            {getGameStatusMessage()}
                        </p>
                        <div
                            className={`mt-1.5 flex flex-wrap justify-center gap-1.5 text-xs sm:mt-2 sm:gap-4 sm:text-sm lg:text-base ${
                                showCards ? 'visible' : 'invisible'
                            }`}
                        >
                            <span className="rounded-lg bg-white/10 px-2 py-0.5 font-bold text-amber-100 sm:px-3 sm:py-1">
                                Dealer: {dealerDisplay}
                            </span>
                            <span className="rounded-lg bg-white/10 px-2 py-0.5 font-bold text-emerald-100 sm:px-3 sm:py-1">
                                Player: {playerCountDisplay || '—'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="min-h-0 flex-1 overflow-hidden bg-[#060606]">
                <MemoBlackjackScene {...tableSceneState} />
            </div>

            {!isDeckShuffled && (
                <div className="pointer-events-auto shrink-0 border-t border-white/10 bg-black/85 px-4 py-4 text-center backdrop-blur-md">
                    <p className="mb-1 text-lg font-bold text-white">Welcome to the table</p>
                    <p className="mb-3 text-sm text-white/70">
                        Choose 1 or 6 decks in Game Controls, then shuffle to start
                    </p>
                    <button
                        type="button"
                        className="rounded-xl bg-amber-500 px-6 py-2 text-sm font-bold text-black transition hover:bg-amber-400"
                        onClick={shuffleDeck}
                    >
                        Shuffle Deck
                    </button>
                </div>
            )}

            {isDeckShuffled && (
                <div
                    className={`pointer-events-auto shrink-0 border-t border-white/15 bg-black/90 p-3 backdrop-blur-md sm:p-4 ${
                        showActionBar ? 'visible' : 'invisible min-h-[4.5rem]'
                    }`}
                >
                    {canPlayerAct && (
                        <div className="mx-auto flex w-full max-w-xl justify-center gap-1.5 sm:gap-3">
                            <button
                                type="button"
                                className="min-w-0 flex-1 rounded-xl bg-white/15 px-2 py-2.5 text-sm font-bold text-white transition hover:bg-white/25 sm:min-w-[5.5rem] sm:px-4 sm:py-3 sm:text-lg"
                                onClick={playerHit}
                            >
                                Hit
                            </button>
                            <button
                                type="button"
                                className="min-w-0 flex-1 rounded-xl bg-amber-500 px-2 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 sm:min-w-[5.5rem] sm:px-4 sm:py-3 sm:text-lg"
                                onClick={playerStay}
                            >
                                Stay
                            </button>
                            <button
                                type="button"
                                disabled={!canSplit}
                                className="min-w-0 flex-1 rounded-xl bg-violet-600 px-2 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[5.5rem] sm:px-4 sm:py-3 sm:text-lg"
                                onClick={playerSplit}
                            >
                                Split
                            </button>
                        </div>
                    )}

                    {isGameOver && (
                        <div className="mx-auto flex w-full max-w-lg flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <p className="text-center text-sm text-white/80 sm:text-left">
                                Round finished — place a new bet to continue.
                            </p>
                            {canDealAgain && (
                                <button
                                    type="button"
                                    onClick={quickDeal}
                                    className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-500"
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
