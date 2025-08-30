import React from "react";
import facedown from "../src/assets/facedown4.jpg";
import { Who, Action, GameState } from '../src/Utils';
import { useGameContext } from "../src/GameContext";

function Card() {
    const {
        // State
        playerCards,
        dealerCards,
        playerCount,
        dealerCount,
        showHoleCard,
        gameState,
        winner,

        // Actions
        playerHit,
        playerStay,
        handleDeal,
    } = useGameContext();

    // Render player cards with responsive layout
    const getPlayerCards = () => {
        if (!playerCards) return null;
        return playerCards.map((card, index) => (
          <div
            key={`player-card-${index}`}
            className="inline-block relative transition-all duration-300 rounded-md"
            style={{
                marginLeft: index > 0 ? `-60px` : '0',
                zIndex: index
            }}
          >
              <img
                src={card}
                alt={`Player card ${index + 1}`}
                className="w-32 h-auto rounded-md shadow-lg"
              />
          </div>
        ));
    };

    // Render dealer cards with responsive layout
    const getDealerCards = () => {
        if (!dealerCards) return null;
        return dealerCards.map((card, index) => {
            const isHoleCard = index === 1;

            return (
              <div
                key={`dealer-card-${index}`}
                className="inline-block relative transition-all duration-300 rounded-md"
                style={{
                    marginLeft: index > 0 ? `-60px` : '0',
                    zIndex: index
                }}
              >
                  <img
                    src={isHoleCard && !showHoleCard ? facedown : card}
                    alt={`Dealer card ${index + 1}`}
                    className="w-32 h-auto rounded-md shadow-lg"
                  />
              </div>
            );
        });
    };

    return (
      <div className="w-full max-w-4xl mx-auto p-4">
          {/* Game status */}
          <div className="mb-4 flex justify-between items-center min-h-[48px]">
              {winner && gameState === GameState.GameConcluded && (
                <div className="text-center p-2 bg-opacity-80 rounded">
                        <span className={`text-2xl font-bold ${
                          winner === Who.Player ? 'text-green-400' :
                            winner === Who.Dealer ? 'text-red-400' :
                              'text-yellow-400'
                        }`}>
                            {winner === "Push" ? "Push!" : `${winner} Wins!`}
                        </span>
                </div>
              )}

              <div>
                    <span className="text-lg text-white font-semibold">
                        Dealer: {showHoleCard ? dealerCount : '?'}
                    </span>
                  <span className="mx-4 text-lg text-white font-semibold">
                        Player: {playerCount}
                    </span>
              </div>
          </div>

          {/* Dealer's cards */}
          <div className="mb-8 min-h-[240px]">
              <h2 className="text-2xl font-bold mb-4 text-white">Dealer's Hand</h2>
              <div className="flex justify-center items-center h-48">
                  {gameState && getDealerCards()}
              </div>
          </div>

          {/* Player's cards */}
          <div className="mb-8 min-h-[240px]">
              <h2 className="text-2xl font-bold mb-4 text-white">Player's Hand</h2>
              <div className="flex justify-center items-center h-48">
                  {gameState && getPlayerCards()}
              </div>
          </div>

          {/* Game controls */}
          <div className="flex justify-center space-x-4 mt-6">
              {gameState === GameState.PlayerPhase && (
                <>
                    <button
                      className="px-6 py-2 bg-green-600 text-white text-lg font-bold rounded shadow hover:bg-green-700 transition"
                      onClick={playerHit}
                    >
                        Hit
                    </button>
                    <button
                      className="px-6 py-2 bg-red-600 text-white text-lg font-bold rounded shadow hover:bg-red-700 transition"
                      onClick={playerStay}
                    >
                        Stay
                    </button>
                </>
              )}

              {gameState === GameState.GameConcluded && (
                <button
                  className="px-6 py-2 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 transition"
                  onClick={handleDeal}
                >
                    Deal Again
                </button>
              )}
          </div>
      </div>
    );
}

export default Card;