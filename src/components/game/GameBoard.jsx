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
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-3 xl:flex-row xl:items-stretch">
                <div className="shrink-0 xl:w-64">
                    <BettingSystem />
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {alertMessage && (
                        <div className="mb-3 shrink-0 animate-pulse rounded-lg border border-amber-400/50 bg-amber-500/20 p-2 text-center text-sm font-bold text-amber-100 backdrop-blur-md">
                            {alertMessage}
                        </div>
                    )}

                    <div className="min-h-0 flex-1">
                        <Card />
                    </div>
                </div>

                <div className="flex min-h-0 h-full w-full shrink-0 flex-col gap-3 xl:w-[22rem]">
                    <div className="flex shrink-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                        <h2 className="mb-4 text-xl font-bold text-white">Game Controls</h2>

                        {!isDeckShuffled && (
                            <div className="mb-4 rounded-xl border border-white/10 bg-black/35 p-4">
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
                                            className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
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
                                    className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-medium text-black transition hover:bg-amber-400"
                                    onClick={shuffleDeck}
                                >
                                    Shuffle {deckCount}-Deck Shoe
                                </button>
                            )}

                            <button
                                type="button"
                                className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20"
                                onClick={resetGame}
                            >
                                Reset Game
                            </button>

                            <GameRules />
                        </div>

                        <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-4">
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
