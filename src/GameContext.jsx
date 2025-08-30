import React, { createContext, useState, useContext, useEffect } from 'react';
import { GameState, Who } from './Utils';

// Create the context
const GameContext = createContext(GameState);

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

  // Hand state
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [dealerCount, setDealerCount] = useState(0);
  const [holeCard, setHoleCard] = useState(null);
  const [showHoleCard, setShowHoleCard] = useState(false);

  // Game result state
  const [winner, setWinner] = useState(null);
  const [roundOver, setRoundOver] = useState(false);
  const [playerBust, setPlayerBust] = useState(false);
  const [dealerBust, setDealerBust] = useState(false);
  const [playerBlackJack, setPlayerBlackJack] = useState(false);
  const [dealerBlackJack, setDealerBlackJack] = useState(false);
  const [push, setPush] = useState(false);

  // Handle game state changes
  useEffect(() => {
    // On mount, load card images
    if (deck.length === 0) {
      getImages();
    }

    // When game is over, set roundOver flag
    if (gameState === GameState.GameConcluded) {
      setRoundOver(true);
    }
  }, [gameState]);

  // Handle alert messages
  useEffect(() => {
    if (alertMessage) {
      // Clear alert after 5 seconds
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 5000);

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

  // --- DECK & CARD LOGIC ---

  const importAllImages = async () => {
    const modulePaths = import.meta.glob('./assets/images/*.{png,jpg,jpeg,js}');
    const imagePromises = Object.keys(modulePaths).map((path) => modulePaths[path]());
    return await Promise.all(imagePromises);
  };

  const getImages = async () => {
    try {
      const images = await importAllImages();
      const imageDefaults = images.map(img => img.default);
      if (imageDefaults.length === 52) {
        setDeck(imageDefaults);
        addLog('Cards loaded successfully.');
      } else {
        addLog(`Error: Loaded ${imageDefaults.length} cards, expected 52.`);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      addLog('Error loading card images.');
    }
  };

  const shuffleDeck = () => {
    if (!deck || deck.length === 0) {
      addLog('No deck to shuffle.');
      return;
    }
    const deckCopy = [...deck];
    for (let i = deckCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }
    setShuffledDeck(deckCopy);
    setIsDeckShuffled(true);
    setGameState(GameState.DeckShuffled);
    addLog('Deck shuffled.');
  };

  const calculateHandValue = (cards) => {
    let total = 0;
    let aces = 0;
    cards.forEach(card => {
      if (card.includes('ace')) {
        aces++;
      } else if (card.includes('king') || card.includes('queen') || card.includes('jack') || card.includes('10')) {
        total += 10;
      } else {
        const match = card.match(/(\d+)_of/);
        if (match && match[1]) {
          total += parseInt(match[1], 10);
        }
      }
    });
    for (let i = 0; i < aces; i++) {
      total += (total + 11 <= 21) ? 11 : 1;
    }
    return total;
  };

  const dealInitialCards = () => {
    addLog('Dealing cards...');
    const deckCopy = [...shuffledDeck];
    const pCards = [deckCopy.pop(), deckCopy.pop()];
    const dCards = [deckCopy.pop(), deckCopy.pop()];

    setPlayerCards(pCards);
    setDealerCards(dCards);
    setHoleCard(dCards[1]);
    setShuffledDeck(deckCopy);

    const pCount = calculateHandValue(pCards);
    const dCount = calculateHandValue(dCards);
    setPlayerCount(pCount);
    setDealerCount(dCount);

    // Check for initial Blackjacks
    const playerBJ = pCount === 21;
    const dealerBJ = dCount === 21;

    if (playerBJ || dealerBJ) {
      setShowHoleCard(true);
      setPlayerBlackJack(playerBJ);
      setDealerBlackJack(dealerBJ);
      if (playerBJ && dealerBJ) {
        setWinner("Push");
        setAlertMessage("Push! Both have Blackjack!");
        addLog("Push! Both have Blackjack.");
        handlePush();
      } else if (playerBJ) {
        setWinner(Who.Player);
        setAlertMessage("Player Blackjack!");
        addLog("Player wins with Blackjack!");
        handleWin(true);
      } else {
        setWinner(Who.Dealer);
        setAlertMessage("Dealer Blackjack!");
        addLog("Dealer wins with Blackjack.");
        handleLoss();
      }
      setGameState(GameState.GameConcluded);
    } else {
      addLog("Player's turn.");
      setGameState(GameState.PlayerPhase);
    }
  };

  // --- PLAYER ACTIONS ---
  const playerHit = () => {
    addLog("Player hits.");
    const deckCopy = [...shuffledDeck];
    const newCard = deckCopy.pop();
    const newPlayerCards = [...playerCards, newCard];
    setPlayerCards(newPlayerCards);
    setShuffledDeck(deckCopy);

    const newPlayerCount = calculateHandValue(newPlayerCards);
    setPlayerCount(newPlayerCount);

    if (newPlayerCount > 21) {
      setPlayerBust(true);
      setWinner(Who.Dealer);
      setAlertMessage("Player busts! Dealer wins.");
      addLog(`Player busts with ${newPlayerCount}.`);
      handleLoss();
      setGameState(GameState.GameConcluded);
    }
  };

  const playerStay = () => {
    addLog("Player stays.");
    setGameState(GameState.DealerPhase);
  };

  // --- DEALER LOGIC ---
  const dealerTurn = () => {
    setShowHoleCard(true);
    addLog("Dealer's turn.");

    let currentDealerCards = [...dealerCards];
    let currentDealerCount = calculateHandValue(currentDealerCards);
    let deckCopy = [...shuffledDeck];

    const play = () => {
      if (currentDealerCount < 17) {
        addLog(`Dealer has ${currentDealerCount} and hits.`);
        const newCard = deckCopy.pop();
        currentDealerCards.push(newCard);
        currentDealerCount = calculateHandValue(currentDealerCards);
        setDealerCards([...currentDealerCards]);
        setDealerCount(currentDealerCount);
        setShuffledDeck([...deckCopy]);
        setTimeout(play, 1000); // Continue hitting after a delay
      } else {
        addLog(`Dealer stands with ${currentDealerCount}.`);
        setDealerCount(currentDealerCount);
        if (currentDealerCount > 21) {
          setDealerBust(true);
          setWinner(Who.Player);
          setAlertMessage("Dealer busts! Player wins.");
          addLog(`Dealer busts with ${currentDealerCount}.`);
          handleWin();
        } else {
          compareScores(playerCount, currentDealerCount);
        }
        setGameState(GameState.GameConcluded);
      }
    };

    setTimeout(play, 1000);
  };

  const compareScores = (pCount, dCount) => {
    if (pCount > dCount) {
      setWinner(Who.Player);
      setAlertMessage(`Player wins with ${pCount}!`);
      addLog(`Player wins: ${pCount} vs ${dCount}.`);
      handleWin();
    } else if (dCount > pCount) {
      setWinner(Who.Dealer);
      setAlertMessage(`Dealer wins with ${dCount}!`);
      addLog(`Dealer wins: ${dCount} vs ${pCount}.`);
      handleLoss();
    } else {
      setWinner("Push");
      setAlertMessage(`Push! Both have ${pCount}!`);
      addLog(`Push! Both have ${pCount}.`);
      handlePush();
    }
  };

  // --- GAME FLOW & EFFECTS ---
  useEffect(() => {
    if (gameState === GameState.DeckShuffled && playerCards.length === 0) {
      dealInitialCards();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.DealerPhase && !roundOver) {
      dealerTurn();
    }
  }, [gameState]);


  const handleWin = (blackjack = false) => {
    const message = blackjack ? 'Player wins with Blackjack!' : 'Player wins!';
    addLog(message);
  };

  const handleLoss = () => {
    addLog('Player loses.');
  };

  const handlePush = () => {
    addLog('Push - round is a draw.');
  };

  // Deals a new hand, resetting the board if a round was just played.
  const handleDeal = () => {
    if (roundOver) {
      addLog('--- Starting New Round ---');
    }

    setWinner(null);
    setRoundOver(false);
    setAlertMessage(null);
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerCount(0);
    setDealerCount(0);
    setHoleCard(null);
    setShowHoleCard(false);
    setPlayerBust(false);
    setDealerBust(false);
    setPlayerBlackJack(false);
    setDealerBlackJack(false);
    setPush(false);

    if (shuffledDeck.length < 20) {
      addLog('Deck is low, reshuffling...');
      shuffleDeck();
    }
    setGameState(GameState.CardsDealt);
    setIsDeckShuffled(true);
  };

  // Reset entire game
  const resetGame = () => {
    clearLogs();
    addLog('--- Game Reset ---');
    setGameState(null);
    setAlertMessage(null);
    setDeck([]);
    setShuffledDeck([]);
    setIsDeckShuffled(false);
    setWinner(null);
    setRoundOver(false);
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerCount(0);
    setDealerCount(0);
    setHoleCard(null);
    setShowHoleCard(false);
    getImages(); // Reload images
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

    // Hand state
    playerCards,
    dealerCards,
    playerCount,
    dealerCount,
    showHoleCard,

    // Game result state
    winner,
    setWinner,
    roundOver,

    // Functions
    shuffleDeck,
    resetGame,
    handleDeal,
    playerHit,
    playerStay,

    // These are mostly for internal use now but can be exposed if needed
    handleWin,
    handleLoss,
    handlePush,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider; // Default export the provider for convenience