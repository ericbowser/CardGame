import React, { useState, useEffect } from 'react';
import { GameState } from '../Utils';

function BettingSystem({
                         playerChips,
                         setPlayerChips,
                         currentBet,
                         setCurrentBet,
                         gameState,
                         setGameState,
                         addLog,
                         winner
                       }) {
  const [betAmount, setBetAmount] = useState(25);
  const [canBet, setCanBet] = useState(true);

  // Standard chip values
  const chipValues = [5, 25, 50, 100];

  // Update betting state based on game state
  useEffect(() => {
    // Can only bet when no current game is in progress
    setCanBet(gameState === null);

    // Handle bet results when game concludes
    if (gameState === GameState.GameConcluded && winner && currentBet > 0) {
      handleBetResult();
    }
  }, [gameState, winner]);

  // Handle bet results
  const handleBetResult = () => {
    if (winner === "Player") {
      // Player wins - regular win pays 1:1
      const winnings = currentBet;
      setPlayerChips(prevChips => prevChips + winnings + currentBet);
      addLog(`Player wins $${winnings}`);
    } else if (winner === "Push") {
      // Push - bet is returned
      setPlayerChips(prevChips => prevChips + currentBet);
      addLog(`Push - bet returned`);
    } else {
      // Player lost - bet is already deducted
      addLog(`Player loses $${currentBet}`);
    }
  };

  // Handle placing bet
  const placeBet = () => {
    if (betAmount <= 0 || betAmount > playerChips) {
      addLog("Invalid bet amount");
      return;
    }

    // Deduct bet from player chips
    setPlayerChips(playerChips - betAmount);
    setCurrentBet(betAmount);
    addLog(`Bet placed: $${betAmount}`);

    // Start the game
    setGameState(GameState.CardsDealt);
  };

  // Handle bet input change
  const handleBetChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setBetAmount(Math.min(value, playerChips));
    }
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
    <div className="w-full max-w-sm mx-auto bg-green-900 bg-opacity-70 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 text-center">Place Your Bet</h2>

      {/* Chip selection */}
      <div className="flex justify-center space-x-2 mb-4">
        {chipValues.map(value => (
          <button
            key={`chip-${value}`}
            className={`w-12 h-12 rounded-full text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition
                            ${value === 5 ? 'bg-red-500' :
              value === 25 ? 'bg-green-500' :
                value === 50 ? 'bg-blue-500' :
                  'bg-purple-500'}`}
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
          className="p-2 w-full rounded-l bg-white text-center text-xl font-bold"
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

      {/* Current chips */}
      <div className="flex justify-between mb-4">
        <span className="text-white">Available: ${playerChips}</span>
        <span className="text-white font-bold">Bet: ${betAmount}</span>
      </div>

      {/* Place bet button */}
      <button
        onClick={placeBet}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-bold rounded shadow transition"
        disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
      >
        Place Bet & Deal
      </button>
    </div>
  );
}

export default BettingSystem;