import React from 'react';
import Card from './Card';
import GameRules from './GameRules';
import BettingSystem from './BettingSystem';
import DeckTrackerPanel from './DeckTrackerPanel';
import { useGameContext } from '../../context';
import { GameState } from '../../constants/game';

const GameBoard = () => {
    const {
        gameState,
        alertMessage,
        isDeckShuffled,
        shuffleDeck,
        resetGame,
        deckCount,
        setDeckCount,
        deckCountOptions,
    } = useGameContext();

    return (
        <div className="flex flex-col lg:h-full lg:min-h-0 lg:flex-1">
            <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:flex-row lg:items-stretch">
                {/* Table first on mobile */}
                <div className="order-1 flex min-h-[min(46vh,400px)] flex-col lg:order-2 lg:min-h-0 lg:min-w-0 lg:flex-1">
                    {alertMessage && (
                        <div className="mb-2 shrink-0 animate-pulse rounded-lg border border-amber-400/50 bg-amber-500/20 p-2 text-center text-sm font-bold text-amber-100 backdrop-blur-md lg:mb-3">
                            {alertMessage}
                        </div>
                    )}

                    <div className="min-h-[min(42vh,360px)] flex-1 lg:min-h-0">
                        <Card />
                    </div>
                </div>

                <div className="order-2 shrink-0 lg:order-1 lg:w-64">
                    <BettingSystem />
                </div>

                <div className="order-3 flex w-full shrink-0 flex-col gap-3 lg:order-3 lg:h-full lg:w-[22rem]">
                    <div className="flex shrink-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-5">
                        <h2 className="mb-3 text-lg font-bold text-white sm:mb-4 sm:text-xl">Game Controls</h2>

                        {!isDeckShuffled && (
                            <div className="mb-4 rounded-xl border border-white/10 bg-black/35 p-3 sm:p-4">
                                <h3 className="mb-2 text-sm font-bold text-white/90">Shoe size</h3>
                                <p className="mb-3 text-xs text-white/55">
                                    Choose before shuffling. Hi-Lo counting adjusts as cards are dealt.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {deckCountOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setDeckCount(option)}
                                            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition sm:py-3 ${
                                                deckCount === option
                                                    ? 'bg-amber-500 text-black'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            {option} Deck{option > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col space-y-2">
                            {!isDeckShuffled && (
                                <button
                                    type="button"
                                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400 sm:py-3"
                                    onClick={shuffleDeck}
                                >
                                    Shuffle {deckCount}-Deck Shoe
                                </button>
                            )}

                            <button
                                type="button"
                                className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 sm:py-3"
                                onClick={resetGame}
                            >
                                Reset Game
                            </button>

                            <GameRules />
                        </div>

                        <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-3 sm:p-4">
                            <h3 className="mb-1 text-sm font-bold text-white/90">Status</h3>
                            <div className="text-sm font-medium text-white/70">
                                {!isDeckShuffled ? 'Choose shoe size and shuffle' :
                                    !gameState ? 'Ready to bet' :
                                        gameState === GameState.PlayerPhase ? 'Your turn' :
                                            gameState === GameState.DealerPhase ? "Dealer's turn" :
                                                gameState === GameState.GameConcluded ? 'Round finished' :
                                                    'Game in progress'}
                            </div>
                        </div>
                    </div>

                    <DeckTrackerPanel />
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
