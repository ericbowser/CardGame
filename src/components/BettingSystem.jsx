import React, { useState } from 'react';
import { useGameContext } from '../GameContext';
import { GameState } from '../Utils';

const BettingSystem = () => {
  const {
    playerChips,
    setPlayerChips,
    setCurrentBet,
    setGameState,
    addLog,
    shuffleAndDeal, // We'll use this function from the context
  } = useGameContext();

  // Local state to manage the bet input field
  const [betAmount, setBetAmount] = useState(10);

  const handleBetChange = (e) => {
    const value = parseInt(e.target.value, 10);
    // Basic validation to ensure the bet is a positive number
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };

  const handlePlaceBet = () => {
    // 1. Validate the bet against player's chips
    if (betAmount > playerChips) {
      addLog("Error: Bet amount cannot exceed your chips.");
      return;
    }
    if (betAmount <= 0) {
      addLog("Error: Bet must be a positive amount.");
      return;
    }

    // 2. Update the global state via context functions
    setPlayerChips(prevChips => prevChips - betAmount);
    setCurrentBet(betAmount);
    addLog(`Player bets ${betAmount} chips.`);

    // 3. Trigger the start of the game round
    // This function should shuffle the deck and change the game state
    shuffleAndDeal();
  };

  return (
    <div className="bg-gray-800 bg-opacity-40 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-white mb-3">Place Your Bet</h3>
      <div className="flex flex-col space-y-3">
        <label htmlFor="bet-input" className="text-white">
          Your Chips: {playerChips}
        </label>
        <input
          id="bet-input"
          type="number"
          value={betAmount}
          onChange={handleBetChange}
          min="1"
          max={playerChips}
          className="p-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handlePlaceBet}
          disabled={betAmount > playerChips || betAmount <= 0}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Place Bet
        </button>
      </div>
    </div>
  );
};

export default BettingSystem;