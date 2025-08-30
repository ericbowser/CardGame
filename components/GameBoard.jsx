import React from 'react';
import Card from "./Card";
import GameRules from "./GameRules";
import { useGameContext } from "../src/GameContext";
import { GameState } from "../src/Utils";

const GameBoard = () => {
    const {
        gameState,
        setGameState,
        alertMessage,
        logs,
        isDeckShuffled,
        shuffleDeck,
        resetGame,
        handleDeal,
    } = useGameContext();

    return (
      <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
              {/* Game controls and logs sidebar */}
              <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-6">
                  <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg shadow-lg mb-6">
                      <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
                      <div className="flex flex-col space-y-3">
                          {!isDeckShuffled && (
                            <button
                              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                              onClick={shuffleDeck}
                              disabled={isDeckShuffled}
                            >
                                Shuffle Deck
                            </button>
                          )}
                          {isDeckShuffled && !gameState && (
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                              onClick={handleDeal}
                            >
                                Deal
                            </button>
                          )}
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                            onClick={resetGame}
                          >
                              Reset Game
                          </button>
                          <div className="mt-2">
                              <GameRules/>
                          </div>
                      </div>
                  </div>

                  {/* Game log */}
                  <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg shadow-lg mt-6">
                      <h2 className="text-xl font-bold text-white mb-2">Game Log</h2>
                      <div className="bg-black bg-opacity-30 p-3 rounded h-80 overflow-y-auto">
                          {logs.map((entry, index) => (
                            <div key={index} className="text-white text-sm mb-1 border-b border-gray-800 pb-1">
                                {entry}
                            </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Main game area */}
              <div className="w-full md:w-3/4">
                  {/* Alert message */}
                  {alertMessage && (
                    <div
                      className="bg-yellow-500 bg-opacity-90 text-white text-center p-3 rounded-lg shadow-lg mb-6 text-xl font-bold">
                        {alertMessage}
                    </div>
                  )}

                  {/* Card component */}
                  {isDeckShuffled ? (
                    <Card/>
                  ) : (
                    <div
                      className="flex justify-center items-center h-96 bg-green-800 bg-opacity-30 rounded-lg shadow-lg">
                        <p className="text-white text-2xl">Shuffle the deck to start playing</p>
                    </div>
                  )}
              </div>
          </div>
      </div>
    );
};

export default GameBoard;