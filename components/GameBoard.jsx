import React from 'react';
import Card from "./Card";
import GameRules from "./GameRules";
import BettingSystem from "./BettingSystem";
import { useGameContext } from "../src/GameContext";
import { GameState } from "../src/Utils";

const GameBoard = () => {
    const {
        gameState,
        alertMessage,
        logs,
        isDeckShuffled,
        shuffleDeck,
        resetGame,
        handleDeal,
        playerCards,
        dealerCards,
        deckWins,
        deckLosses,
        deckPushes,
        deckBlackjacks,
        cardsRemaining,
    } = useGameContext();

    const hasActiveGame = gameState && (playerCards.length > 0 || dealerCards.length > 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Game controls and logs sidebar */}
                <div className="w-full lg:w-1/3 xl:w-1/4">
                    {/* Betting System */}
                    <div className="mb-6">
                        <BettingSystem />
                    </div>

                    <div className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-2xl shadow-mint-lg mb-6 border border-mint-200">
                        <h2 className="text-2xl font-bold text-mint-800 mb-4 flex items-center">
                            🎮 Game Controls
                        </h2>
                        <div className="flex flex-col space-y-3">
                            {!isDeckShuffled && (
                                <button
                                    className="px-4 py-3 bg-mint-500 text-white rounded-xl shadow-mint hover:bg-mint-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 font-medium"
                                    style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}
                                    onClick={shuffleDeck}
                                    disabled={isDeckShuffled}
                                >
                                    🔀 Shuffle Deck
                                </button>
                            )}

                            <button
                                className="px-4 py-3 bg-mint-300 text-mint-800 rounded-xl shadow-mint hover:bg-mint-400 transform hover:scale-105 transition-all duration-200 font-medium"
                                onClick={resetGame}
                            >
                                ↻ Reset Game
                            </button>

                            <div className="mt-2">
                                <GameRules/>
                            </div>
                        </div>

                        {/* Game Status */}
                        <div className="mt-6 p-4 bg-mint-50 rounded-xl border-l-4 border-mint-400">
                            <h3 className="text-mint-800 font-bold mb-2 flex items-center">
                                📊 Status
                            </h3>
                            <div className="text-sm text-mint-700 font-semibold">
                                {!isDeckShuffled ? '🎴 Deck needs shuffling' :
                                    !gameState ? '✨ Ready to bet' :
                                        gameState === GameState.PlayerPhase ? '👤 Your turn' :
                                            gameState === GameState.DealerPhase ? '🤖 Dealer\'s turn' :
                                                gameState === GameState.GameConcluded ? '🏁 Round finished' :
                                                    '⚡ Game in progress'}
                            </div>
                        </div>

                        {/* This deck — wins/losses (resets on shuffle; for basic strategy & counting practice) */}
                        {isDeckShuffled && (
                            <div className="mt-6 p-4 bg-sage-50 rounded-xl border-l-4 border-sage-500">
                                <h3 className="text-sage-800 font-bold mb-3 flex items-center">
                                    📈 This deck
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-sage-700 font-medium">Wins</div>
                                    <div className="text-sage-800 font-bold text-right">{deckWins}</div>
                                    <div className="text-sage-700 font-medium">Losses</div>
                                    <div className="text-sage-800 font-bold text-right">{deckLosses}</div>
                                    <div className="text-sage-700 font-medium">Pushes</div>
                                    <div className="text-sage-800 font-bold text-right">{deckPushes}</div>
                                    <div className="text-sage-700 font-medium">Blackjacks</div>
                                    <div className="text-sage-800 font-bold text-right">{deckBlackjacks}</div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-sage-200 flex justify-between items-center">
                                    <span className="text-sage-700 font-medium text-sm">Cards left</span>
                                    <span className="text-sage-800 font-bold">{cardsRemaining}</span>
                                </div>
                                <p className="text-xs text-sage-600 mt-2 italic">Resets when deck is shuffled.</p>
                            </div>
                        )}
                    </div>

                    {/* Game log */}
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-mint-lg border border-mint-200">
                        <h2 className="text-2xl font-bold text-sage-800 mb-4 flex items-center">
                            📜 Game Log
                        </h2>
                        <div className="bg-sage-50 p-4 rounded-xl h-80 overflow-y-auto border border-sage-200">
                            {logs.length === 0 ? (
                                <div className="text-sage-600 text-sm text-center mt-8 italic font-medium">
                                    Game events will appear here...
                                </div>
                            ) : (
                                logs.map((entry, index) => (
                                    <div key={index} className="text-sage-800 text-sm mb-2 p-2 bg-white rounded-lg border-l-3 border-mint-300 last:border-b-0 shadow-sm font-medium">
                                  <span className="text-mint-600 text-xs font-semibold mr-2">
                                      {new Date().toLocaleTimeString()}
                                  </span>
                                        {entry}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main game area */}
                <div className="w-full lg:w-2/3 xl:w-3/4">
                    {/* Alert message */}
                    {alertMessage && (
                        <div className="bg-yellow-500 bg-opacity-90 text-white text-center p-3 rounded-lg shadow-lg mb-6 text-xl font-bold animate-pulse">
                            {alertMessage}
                        </div>
                    )}

                    {/* Card component */}
                    {isDeckShuffled ? (
                        <Card/>
                    ) : (
                        <div className="flex flex-col justify-center items-center h-96 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-mint-lg border border-mint-200">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎴</div>
                                <p className="text-mint-800 text-2xl mb-4 font-bold">Welcome to Blackjack!</p>
                                <p className="text-mint-700 text-lg mb-6 font-medium">
                                    Shuffle the deck to start playing
                                </p>
                                <button
                                    className="px-6 py-3 bg-mint-500 hover:bg-mint-600 text-white text-lg font-bold rounded-xl shadow-mint-lg transition transform hover:scale-105"
                                    onClick={shuffleDeck}
                                >
                                    Shuffle Deck to Begin
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameBoard;