// components/BettingControls.jsx
import React, { useState } from 'react';
import { useGameContext } from '../src/GameContext';
import { GameState } from '../src/Utils';

const BettingControls = () => {
  const {
    playerChips,
    currentBet,
    canBet,
    placeBet,
    gameState,
    setGameState,
    addLog
  } = useGameContext();

  const [betAmount, setBetAmount] = useState(25);

  // Standard chip values
  const chipValues = [5, 25, 50, 100, 500];

  // Handle bet change
  const handleBetChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(value);
    }
  };

  // Handle placing bet
  const handlePlaceBet = () => {
    if (placeBet(betAmount)) {
      setGameState(GameState.CardsDealt);
    } else {
      addLog('Invalid bet amount');
    }
  };

  // Handle chip click
  const handleChipClick = (value) => {
    if (value + betAmount <= playerChips) {
      setBetAmount(prevAmount => prevAmount + value);
    }
  };

  // Clear bet
  const clearBet = () => {
    setBetAmount(0);
  };

  // Max bet
  const maxBet = () => {
    setBetAmount(playerChips);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-green-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Place Your Bet</h2>

      {/* Chip selector */}
      <div className="flex justify-center gap-2 mb-4">
        {chipValues.map(value => (
          <button
            key={`chip-${value}`}
            className={`w-12 h-12 rounded-full font-bold text-white flex items-center justify-center transition
              ${value === 5 ? 'bg-red-600 hover:bg-red-700' :
              value === 25 ? 'bg-green-600 hover:bg-green-700' :
                value === 50 ? 'bg-blue-600 hover:bg-blue-700' :
                  value === 100 ? 'bg-purple-600 hover:bg-purple-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
            }`}
            onClick={() => handleChipClick(value)}
            disabled={!canBet || value + betAmount > playerChips}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Bet controls */}
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="number"
            value={betAmount}
            onChange={handleBetChange}
            min="0"
            max={playerChips}
            className="px-3 py-2 bg-white rounded-l text-center w-full"
            disabled={!canBet}
          />
          <button
            onClick={clearBet}
            className="px-3 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            disabled={!canBet}
          >
            Clear
          </button>
          <button
            onClick={maxBet}
            className="px-3 py-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-r"
            disabled={!canBet}
          >
            Max
          </button>
        </div>
      </div>

      {/* Available chips */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-white">Available: ${playerChips}</span>
        <span className="text-white font-bold">Current Bet: ${currentBet || betAmount}</span>
      </div>

      {/* Place bet button */}
      <button
        onClick={handlePlaceBet}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition"
        disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
      >
        Place Bet
      </button>
    </div>
  );
};

export default BettingControls;