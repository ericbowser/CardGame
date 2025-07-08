import React, { useEffect, useState } from 'react';
import Card from "./Card";
import BettingSystem from "./BettingSystem";
import GameRules from "./GameRules";
import { GameState } from "../Utils";
import { useGameContext } from '../GameContext'; // Import the custom hook

const Deck = () => {
    // Get all state and functions from the context
    const {
        gameState,
        winner,
        shuffledDeck,
        logs,
        resetGame,
    } = useGameContext();

    // Local UI state for the alert message
    const [alertMessage, setAlertMessage] = useState(null);

    // Effect to show winner message
    useEffect(() => {
        if (winner) {
            const message = winner === "Push" ? "It's a push!" : `${winner} wins!`;
            setAlertMessage(message);
            const timer = setTimeout(() => setAlertMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [winner]);

    const isGameInProgress = shuffledDeck.length > 0;

    return (
      <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-6">
                  <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg shadow-lg mb-6">
                      <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
                      <div className="flex flex-col space-y-3">
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                            onClick={resetGame}
                          >
                              Reset Game
                          </button>
                          <div className="mt-2">
                              <GameRules />
                          </div>
                      </div>
                  </div>

                  {/* Betting system is now self-contained and uses the context */}
                  {gameState === GameState.Ready && <BettingSystem />}

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
                  {alertMessage && (
                    <div className="bg-yellow-500 bg-opacity-90 text-white text-center p-3 rounded-lg shadow-lg mb-6 text-xl font-bold">
                        {alertMessage}
                    </div>
                  )}

                  {/* The Card component will also be refactored to use the context */}
                  {isGameInProgress ? (
                    <Card />
                  ) : (
                    <div className="flex justify-center items-center h-96 bg-green-800 bg-opacity-30 rounded-lg shadow-lg">
                        <p className="text-white text-2xl">Place a bet to start the game</p>
                    </div>
                  )}
              </div>
          </div>
      </div>
    );
};

export default Deck;