// src/GameContext.jsx - Complete replacement for your existing file
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create the context - this becomes our central nervous system
const GameContext = createContext();

// Custom hook that makes using the context more convenient and safer
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

// The main provider component - this replaces your scattered state management
export const GameProvider = ({ children }) => {
  // Game state - controls the flow of the entire game
  const [gameState, setGameState] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [logs, setLogs] = useState([]);

  // Deck state - manages the card deck and shuffling
  const [deck, setDeck] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [isDeckShuffled, setIsDeckShuffled] = useState(false);

  // Card state - tracks cards in each hand
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [showDealerHoleCard, setShowDealerHoleCard] = useState(false);

  // Game calculations - derived state that updates automatically
  const [playerCount, setPlayerCount] = useState(0);
  const [dealerCount, setDealerCount] = useState(0);
  const [playerBlackjack, setPlayerBlackjack] = useState(false);
  const [dealerBlackjack, setDealerBlackjack] = useState(false);
  const [playerBust, setPlayerBust] = useState(false);
  const [dealerBust, setDealerBust] = useState(false);

  // Player state - manages money and betting
  const [playerChips, setPlayerChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [canBet, setCanBet] = useState(true);

  // Game result state - tracks wins, losses, and pushes
  const [winner, setWinner] = useState(null);
  const [roundOver, setRoundOver] = useState(false);

  /**
   * Enhanced card value calculation with comprehensive error handling
   * This function properly handles aces, face cards, and number cards
   * while being defensive against malformed card data
   */
  const calculateHandValue = useCallback((cards) => {
    if (!cards || cards.length === 0) return 0;

    let total = 0;
    let aces = 0;

    // Process each card and extract its value
    cards.forEach(card => {
      try {
        if (typeof card === 'string') {
          if (card.includes('ace')) {
            aces++;
          } else if (card.includes('king') || card.includes('queen') || card.includes('jack')) {
            total += 10;
          } else if (card.includes('10')) {
            total += 10;
          } else {
            // Extract number from card name (e.g., "2_of_hearts.png" -> 2)
            const match = card.match(/(\d+)_of/);
            if (match && match[1]) {
              const value = parseInt(match[1]);
              if (value >= 2 && value <= 9) {
                total += value;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing card:', card, error);
        addLog(`Error processing card: ${card}`);
      }
    });

    // Add aces optimally - this is where the "soft" hand logic happens
    // We try to use aces as 11 when possible, falling back to 1
    for (let i = 0; i < aces; i++) {
      if (total + 11 <= 21) {
        total += 11;
      } else {
        total += 1;
      }
    }

    return total;
  }, []);

  /**
   * Check if a hand is a blackjack (natural 21)
   * Must be exactly 2 cards: an Ace and a 10-value card
   */
  const isBlackjack = useCallback((cards) => {
    if (cards.length !== 2) return false;

    const hasAce = cards.some(card => card.includes('ace'));
    const hasTenValue = cards.some(card =>
      card.includes('10') ||
      card.includes('jack') ||
      card.includes('queen') ||
      card.includes('king')
    );

    return hasAce && hasTenValue;
  }, []);

  /**
   * Determine if a hand is "soft" (has an ace counted as 11)
   * This affects basic strategy decisions
   */
  const isSoftHand = useCallback((cards, total) => {
    const hasAce = cards.some(card => card.includes('ace'));
    return hasAce && total <= 21 && total >= 12;
  }, []);

  /**
   * Enhanced deck shuffling that works with your existing asset structure
   * This maintains compatibility with your current image loading system
   */
  const shuffleDeck = useCallback(() => {
    if (!deck || deck.length === 0) {
      addLog('No deck to shuffle');
      return false;
    }

    try {
      // Create a copy and shuffle using Fisher-Yates algorithm
      const deckCopy = [...deck];
      const shuffled = [];

      // Fisher-Yates shuffle - this is the gold standard for random shuffling
      for (let i = deckCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
      }

      // Extract image paths from your existing module structure
      deckCopy.forEach(cardModule => {
        if (cardModule?.default) {
          shuffled.push(cardModule.default);
        }
      });

      // Validate we have a complete deck - this prevents game-breaking bugs
      if (shuffled.length === 52) {
        setShuffledDeck(shuffled);
        setIsDeckShuffled(true);
        addLog('Deck shuffled successfully');
        return true;
      } else {
        console.error(`Incomplete deck: expected 52 cards, got ${shuffled.length}`);
        addLog(`Error: Incomplete deck (${shuffled.length}/52 cards)`);
        return false;
      }
    } catch (error) {
      console.error('Error shuffling deck:', error);
      addLog('Error shuffling deck');
      return false;
    }
  }, [deck]);

  /**
   * Load card images using your existing import.meta.glob system
   * This maintains compatibility with your current asset loading
   */
  const loadDeck = useCallback(async () => {
    try {
      const modulePaths = import.meta.glob('../src/assets/images/*.{png,jpg,jpeg}');
      const imagePromises = Object.keys(modulePaths).map((path) => modulePaths[path]());
      const images = await Promise.all(imagePromises);

      setDeck(images);
      addLog('Card images loaded successfully');
      return images;
    } catch (error) {
      console.error('Error loading card images:', error);
      addLog('Error loading card images');
      return [];
    }
  }, []);

  /**
   * Deal initial cards for a new hand
   * This replaces the scattered card dealing logic from your original components
   */
  const dealInitialCards = useCallback(() => {
    if (shuffledDeck.length < 4) {
      addLog('Not enough cards in deck');
      return false;
    }

    try {
      // Create a working copy to avoid mutating the original deck
      const workingDeck = [...shuffledDeck];

      // Deal cards: Player, Dealer, Player, Dealer (standard blackjack protocol)
      const newPlayerCards = [workingDeck.pop(), workingDeck.pop()];
      const newDealerCards = [workingDeck.pop(), workingDeck.pop()];

      setPlayerCards(newPlayerCards);
      setDealerCards(newDealerCards);
      setShuffledDeck(workingDeck);
      setShowDealerHoleCard(false);

      addLog('Initial cards dealt');
      return true;
    } catch (error) {
      console.error('Error dealing cards:', error);
      addLog('Error dealing cards');
      return false;
    }
  }, [shuffledDeck]);

  /**
   * Player hits (takes another card)
   * Returns boolean to indicate success/failure
   */
  const playerHit = useCallback(() => {
    if (shuffledDeck.length === 0) {
      addLog('No more cards in deck');
      return false;
    }

    try {
      const workingDeck = [...shuffledDeck];
      const newCard = workingDeck.pop();

      setPlayerCards(prev => [...prev, newCard]);
      setShuffledDeck(workingDeck);
      addLog('Player hits');
      return true;
    } catch (error) {
      console.error('Error hitting:', error);
      addLog('Error dealing card');
      return false;
    }
  }, [shuffledDeck]);

  /**
   * Dealer hits (automated based on house rules)
   * This handles the dealer's automatic play
   */
  const dealerHit = useCallback(() => {
    if (shuffledDeck.length === 0) {
      addLog('No more cards in deck');
      return false;
    }

    try {
      const workingDeck = [...shuffledDeck];
      const newCard = workingDeck.pop();

      setDealerCards(prev => [...prev, newCard]);
      setShuffledDeck(workingDeck);
      addLog('Dealer hits');
      return true;
    } catch (error) {
      console.error('Error dealer hitting:', error);
      addLog('Error dealing card to dealer');
      return false;
    }
  }, [shuffledDeck]);

  /**
   * Game log functions with improved safety
   * These replace your existing useGameLog hook
   */
  const addLog = useCallback((message) => {
    if (message && typeof message === 'string') {
      setLogs(prevLogs => [...prevLogs, message]);
    }
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /**
   * Enhanced betting functions with comprehensive validation
   * This replaces the scattered betting logic from your original components
   */
  const placeBet = useCallback((amount) => {
    // Comprehensive validation prevents game-breaking scenarios
    if (!amount || amount <= 0) {
      addLog("Bet amount must be greater than 0");
      return false;
    }

    if (amount > playerChips) {
      addLog("Insufficient chips for this bet");
      return false;
    }

    if (!canBet) {
      addLog("Cannot bet at this time");
      return false;
    }

    // Deduct chips immediately when bet is placed
    setPlayerChips(prev => prev - amount);
    setCurrentBet(amount);
    setCanBet(false);
    addLog(`Bet placed: $${amount}`);
    return true;
  }, [playerChips, canBet, addLog]);

  /**
   * Handle different win scenarios with proper payouts
   * Blackjack pays 3:2, regular wins pay 1:1
   */
  const handleWin = useCallback((isBlackjackWin = false) => {
    const winMultiplier = isBlackjackWin ? 1.5 : 1;
    const winAmount = Math.floor(currentBet * winMultiplier);
    const totalReturn = currentBet + winAmount;

    setPlayerChips(prev => prev + totalReturn);
    addLog(`Player wins $${winAmount}${isBlackjackWin ? ' (Blackjack!)' : ''}`);
  }, [currentBet, addLog]);

  const handleLoss = useCallback(() => {
    addLog(`Player loses $${currentBet}`);
    // Chips already deducted when bet was placed
  }, [currentBet, addLog]);

  const handlePush = useCallback(() => {
    setPlayerChips(prev => prev + currentBet);
    addLog('Push - bet returned');
  }, [currentBet, addLog]);

  /**
   * Reset functions for new rounds and complete game resets
   * These replace the scattered reset logic from your original components
   */
  const startNewRound = useCallback(() => {
    setGameState(null);
    setPlayerCards([]);
    setDealerCards([]);
    setShowDealerHoleCard(false);
    setPlayerCount(0);
    setDealerCount(0);
    setPlayerBlackjack(false);
    setDealerBlackjack(false);
    setPlayerBust(false);
    setDealerBust(false);
    setWinner(null);
    setRoundOver(false);
    setCurrentBet(0);
    setCanBet(true);
    addLog('New round started');
  }, [addLog]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setAlertMessage(null);
    setPlayerCards([]);
    setDealerCards([]);
    setShowDealerHoleCard(false);
    setPlayerCount(0);
    setDealerCount(0);
    setPlayerBlackjack(false);
    setDealerBlackjack(false);
    setPlayerBust(false);
    setDealerBust(false);
    setShuffledDeck([]);
    setIsDeckShuffled(false);
    setWinner(null);
    setRoundOver(false);
    setPlayerChips(1000);
    setCurrentBet(0);
    setCanBet(true);
    clearLogs();
    addLog('Game reset');
  }, [clearLogs, addLog]);

  /**
   * Effects that automatically manage derived state
   * These replace the scattered useEffect calls in your original components
   */

  // Update hand values when cards change
  useEffect(() => {
    const newPlayerCount = calculateHandValue(playerCards);
    const newDealerCount = calculateHandValue(dealerCards);

    setPlayerCount(newPlayerCount);
    setDealerCount(newDealerCount);

    // Check for busts
    setPlayerBust(newPlayerCount > 21);
    setDealerBust(newDealerCount > 21);

    // Check for blackjacks
    setPlayerBlackjack(isBlackjack(playerCards));
    setDealerBlackjack(isBlackjack(dealerCards));
  }, [playerCards, dealerCards, calculateHandValue, isBlackjack]);

  // Auto-clear alert messages
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Load deck on mount
  useEffect(() => {
    if (deck.length === 0) {
      loadDeck();
    }
  }, [deck.length, loadDeck]);

  // Auto-shuffle when deck is loaded
  useEffect(() => {
    if (!isDeckShuffled && deck.length > 0) {
      shuffleDeck();
    }
  }, [isDeckShuffled, deck.length, shuffleDeck]);

  /**
   * The context value - this is what all your components will receive
   * Notice how comprehensive this is compared to your original context
   */
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
    shuffledDeck,
    isDeckShuffled,
    shuffleDeck,
    loadDeck,

    // Card state
    playerCards,
    dealerCards,
    showDealerHoleCard,
    setShowDealerHoleCard,

    // Game calculations
    playerCount,
    dealerCount,
    playerBlackjack,
    dealerBlackjack,
    playerBust,
    dealerBust,
    calculateHandValue,
    isBlackjack,
    isSoftHand,

    // Player state
    playerChips,
    setPlayerChips,
    currentBet,
    canBet,

    // Game actions
    dealInitialCards,
    playerHit,
    dealerHit,

    // Game result state
    winner,
    setWinner,
    roundOver,
    setRoundOver,

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