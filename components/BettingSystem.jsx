import React, { useState, useEffect } from 'react';
import { GameState } from '../src/Utils';
import { useGameContext } from '../src/GameContext';

function BettingSystem() {
  const {
    playerChips,
    currentBet,
    gameState,
    placeBet: placeBetInContext,
    handleDeal,
    roundOver,
    lastBetAmount,
    quickDeal
  } = useGameContext();

  const [betAmount, setBetAmount] = useState(25);
  const [canBet, setCanBet] = useState(true);

  // Standard chip values
  const chipValues = [5, 25, 50, 100];

  // Update betting state based on game state
  useEffect(() => {
    // Can bet when: no game in progress, or round is over
    const canPlaceBet = gameState === null || 
                       gameState === GameState.GameConcluded || 
                       roundOver;
    setCanBet(canPlaceBet);

    // When round is over, set bet amount to last bet amount (for quick replay)
    if (roundOver) {
      setBetAmount(Math.min(lastBetAmount, playerChips));
    }
  }, [gameState, roundOver, lastBetAmount, playerChips]);

  // Handle placing bet
  const handlePlaceBet = () => {
    if (betAmount <= 0 || betAmount > playerChips) {
      return;
    }

    if (placeBetInContext(betAmount)) {
      // After placing bet, deal cards
      handleDeal();
    }
  };

  // Handle bet input change
  const handleBetChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setBetAmount(Math.min(Math.max(0, value), playerChips));
  };

  // Handle chip click to increase bet
  const handleChipClick = (value) => {
    const newAmount = Math.min(betAmount + value, playerChips);
    setBetAmount(newAmount);
  };

  // Max bet
  const maxBet = () => {
    setBetAmount(playerChips);
  };

  // Clear bet
  const clearBet = () => {
    setBetAmount(0);
  };

  return (
    <div className="w-full bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-mint-lg border border-mint-200">
      <h2 className="text-2xl font-bold text-mint-800 mb-4 text-center flex items-center justify-center">
        💰 Place Your Bet
      </h2>

      {/* Current chips display */}
      <div className="bg-mint-50 rounded-xl p-4 mb-4 border border-mint-200">
        <div className="flex justify-between items-center">
          <span className="text-mint-800 font-semibold">Chips:</span>
          <span className="text-2xl font-extrabold text-mint-700">${playerChips}</span>
        </div>
        {currentBet > 0 && (
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-mint-200">
            <span className="text-sage-800 font-semibold">Current Bet:</span>
            <span className="text-xl font-extrabold text-sage-700">${currentBet}</span>
          </div>
        )}
      </div>

      {/* Chip selection */}
      <div className="flex justify-center space-x-3 mb-4">
        {chipValues.map(value => (
          <button
            key={`chip-${value}`}
            className={`w-14 h-14 rounded-full text-white font-bold shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200 text-sm
                            ${value === 5 ? 'bg-red-500 hover:bg-red-600' :
              value === 25 ? 'bg-green-500 hover:bg-green-600' :
                value === 50 ? 'bg-blue-500 hover:bg-blue-600' :
                  'bg-purple-500 hover:bg-purple-600'}`}
            onClick={() => handleChipClick(value)}
            disabled={!canBet || betAmount + value > playerChips}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Bet input */}
      <div className="flex mb-4">
        <input
          type="number"
          value={betAmount}
          onChange={handleBetChange}
          min="0"
          max={playerChips}
          className="p-3 w-full rounded-l-lg bg-white text-center text-xl font-bold border-2 border-mint-200 focus:border-mint-500 focus:outline-none"
          disabled={!canBet}
        />
        <button
          onClick={clearBet}
          className="px-4 py-3 bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium"
          disabled={!canBet}
        >
          Clear
        </button>
        <button
          onClick={maxBet}
          className="px-4 py-3 bg-yellow-500 text-white hover:bg-yellow-600 rounded-r-lg transition font-medium"
          disabled={!canBet}
        >
          Max
        </button>
      </div>

      {/* Place bet button */}
      <button
        onClick={handlePlaceBet}
        className="w-full py-3 bg-gradient-to-r from-mint-500 to-sage-500 hover:from-mint-600 hover:to-sage-600 text-white text-lg font-bold rounded-xl shadow-mint-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
      >
        {currentBet > 0 ? 'Deal Cards' : 'Place Bet & Deal'}
      </button>

      {/* Quick Deal Again button - appears when round is over */}
      {roundOver && lastBetAmount > 0 && lastBetAmount <= playerChips && (
        <button
          onClick={quickDeal}
          className="w-full mt-3 py-3 bg-gradient-to-r from-sage-500 to-mint-500 hover:from-sage-600 hover:to-mint-600 text-white text-lg font-bold rounded-xl shadow-mint-lg transition-all duration-200 transform hover:scale-105"
        >
          🎴 Deal Again (${lastBetAmount})
        </button>
      )}

      {/* Info about payouts */}
      <div className="mt-4 text-xs text-mint-700 font-medium text-center">
        <p>Blackjack pays 3:2 • Regular wins pay 1:1</p>
      </div>
    </div>
  );
}

export default BettingSystem;