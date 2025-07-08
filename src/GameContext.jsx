import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { GameState } from './Utils';
import useGameLog from './GameLog';

// Create the context
const GameContext = createContext(null);

// The Provider component that will wrap our app
export const GameProvider = ({ children }) => {
  // --- All state now lives here ---
  const [gameState, setGameState] = useState(GameState.Ready);
  const [winner, setWinner] = useState(null);
  const [deck, setDeck] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [playerChips, setPlayerChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const { logs, addLog, clearLogs } = useGameLog([]);

  // --- Core Game Logic ---

  // Create the initial deck of cards as structured data
  useEffect(() => {
    const suits = ['♠', '♣', '♥', '♦'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const values = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

    const createdDeck = [];
    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < suits.length; j++) {
        createdDeck.push({ rank: ranks[i], suit: suits[j], value: values[i] });
      }
    }
    setDeck(createdDeck);
    addLog('Game Ready. Place a bet to start.');
  }, []);

  // Shuffle the deck
  const shuffleAndDeal = () => {
    if (deck.length === 0) return;

    // Fisher-Yates shuffle algorithm
    const newShuffledDeck = [...deck];
    for (let i = newShuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newShuffledDeck[i], newShuffledDeck[j]] = [newShuffledDeck[j], newShuffledDeck[i]];
    }

    setShuffledDeck(newShuffledDeck);
    addLog(`Deck shuffled. Dealing cards...`);
    setGameState(GameState.CardsDealt);
  };

  // Reset the game for a new round
  const resetGame = () => {
    setGameState(GameState.Ready);
    setWinner(null);
    setShuffledDeck([]);
    setCurrentBet(0);
    clearLogs();
    addLog('Game reset. Place a bet to start.');
  };

  // Memoize the context value for performance
  const value = useMemo(() => ({
    gameState,
    setGameState,
    winner,
    setWinner,
    shuffledDeck,
    playerChips,
    setPlayerChips,
    currentBet,
    setCurrentBet,
    logs,
    addLog,
    shuffleAndDeal,
    resetGame,
  }), [gameState, winner, shuffledDeck, playerChips, currentBet, logs]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to easily access the context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};;