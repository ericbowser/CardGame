// src/GameContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { GameState } from './Utils';

// Create the context
const GameContext = createContext();

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

// Provider component
export const GameProvider = ({ children }) => {
  // Game state
  const [gameState, setGameState] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [logs, setLogs] = useState([]);

  // Deck state
  const [deck, setDeck] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [isDeckShuffled, setIsDeckShuffled] = useState(false);

  // Player state
  const [playerChips, setPlayerChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [canBet, setCanBet] = useState(true);

  // Game result state
  const [winner, setWinner] = useState(null);
  const [roundOver, setRoundOver] = useState(false);

  // Handle game state changes
  useEffect(() => {
    if (gameState === GameState.GameConcluded) {
      setRoundOver(true);
      setCanBet(true);
    }
  }, [gameState]);

  // Handle alert messages
  useEffect(() => {
    if (alertMessage) {
      // Clear alert after 3 seconds
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Game log functions
  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, message]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Betting functions
  const placeBet = (amount) => {
    if (amount <= playerChips && amount > 0 && canBet) {
      setCurrentBet(amount);
      setCanBet(false);
      addLog(`Bet placed: $${amount}`);
      return true;
    }
    return false;
  };

  const handleWin = (blackjack = false) => {
    const winAmount = blackjack ? currentBet * 1.5 : currentBet;
    setPlayerChips(prev => prev + winAmount);
    addLog(`Player wins $${winAmount}`);
  };

  const handleLoss = () => {
    setPlayerChips(prev => prev - currentBet);
    addLog(`Player loses $${currentBet}`);
  };

  const handlePush = () => {
    addLog('Push - bet returned');
  };

  // Reset for new round
  const startNewRound = () => {
    setGameState(null);
    setWinner(null);
    setRoundOver(false);
    setCurrentBet(0);
    setCanBet(true);
    addLog('Starting new round');
  };

  // Reset entire game
  const resetGame = () => {
    setGameState(null);
    setAlertMessage(null);
    setShuffledDeck([]);
    setIsDeckShuffled(false);
    setWinner(null);
    setRoundOver(false);
    setPlayerChips(1000);
    setCurrentBet(0);
    setCanBet(true);
    clearLogs();
  };

  // Provide the context value
  const value = {
    // Game state
    gameState,
    setGameState,
    alertMessage,
    setAlertMessage,
    logs,
    addLog,
    clearLogs,

    // Deck state
    deck,
    setDeck,
    shuffledDeck,
    setShuffledDeck,
    isDeckShuffled,
    setIsDeckShuffled,

    // Player state
    playerChips,
    setPlayerChips,
    currentBet,
    setCurrentBet,
    canBet,

    // Game result state
    winner,
    setWinner,
    roundOver,

    // Functions
    placeBet,
    handleWin,
    handleLoss,
    handlePush,
    startNewRound,
    resetGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;