import React from 'react';
import Card from "./Card";
import GameRules from "./GameRules";
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
    } = useGameContext();

    const hasActiveGame = gameState && (playerCards.length > 0 || dealerCards.length > 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Game controls and logs sidebar */}
                <div className="w-full lg:w-1/3 xl:w-1/4">
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-mint-lg mb-6 border border-mint-200">
                        <h2 className="text-2xl font-bold text-mint-700 mb-4 flex items-center">
                            🎮 Game Controls
                        </h2>
                        <div className="flex flex-col space-y-3">
                            {!isDeckShuffled && (
                                <button
                                    className="px-4 py-3 bg-mint-500 text-white rounded-xl shadow-mint hover:bg-mint-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 font-medium"
                                    onClick={shuffleDeck}
                                    disabled={isDeckShuffled}
                                >
                                    🔀 Shuffle Deck
                                </button>
                            )}

                            {isDeckShuffled && !hasActiveGame && !gameState && (
                                <button
                                    className="px-4 py-3 bg-sage-500 text-white rounded-xl shadow-sage hover:bg-sage-600 transform hover:scale-105 transition-all duration-200 font-medium"
                                    onClick={handleDeal}
                                >
                                    🎴 Deal Cards
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
                            <h3 className="text-mint-700 font-bold mb-2 flex items-center">
                                📊 Status
                            </h3>
                            <div className="text-sm text-mint-600 font-medium">
                                {!isDeckShuffled ? '🎴 Deck needs shuffling' :
                                    !gameState ? '✨ Ready to deal' :
                                        gameState === GameState.PlayerPhase ? '👤 Your turn' :
                                            gameState === GameState.DealerPhase ? '🤖 Dealer\'s turn' :
                                                gameState === GameState.GameConcluded ? '🏁 Round finished' :
                                                    '⚡ Game in progress'}
                            </div>
                        </div>
                    </div>

                    {/* Game log */}
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-mint-lg border border-mint-200">
                        <h2 className="text-2xl font-bold text-sage-700 mb-4 flex items-center">
                            📜 Game Log
                        </h2>
                        <div className="bg-sage-50 p-4 rounded-xl h-80 overflow-y-auto border border-sage-200">
                            {logs.length === 0 ? (
                                <div className="text-sage-400 text-sm text-center mt-8 italic">
                                    Game events will appear here...
                                </div>
                            ) : (
                                logs.map((entry, index) => (
                                    <div key={index} className="text-sage-700 text-sm mb-2 p-2 bg-white rounded-lg border-l-3 border-mint-300 last:border-b-0 shadow-sm">
                                  <span className="text-mint-500 text-xs font-medium mr-2">
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
                        <div className="flex flex-col justify-center items-center h-96 bg-green-800 bg-opacity-30 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎴</div>
                                <p className="text-white text-2xl mb-4">Welcome to Blackjack!</p>
                                <p className="text-white text-lg opacity-75 mb-6">
                                    Shuffle the deck to start playing
                                </p>
                                <button
                                    className="px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow hover:bg-green-700 transition transform hover:scale-105"
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