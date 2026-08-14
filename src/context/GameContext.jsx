import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

import {

    DEFAULT_BET,

    DEFAULT_DECK_COUNT,

    DEFAULT_STARTING_CHIPS,

    DECK_COUNT_OPTIONS,

    FULL_DECK_SIZE,

    GameState,

    Who,

    getLowDeckThreshold,

    getShoeSize,

} from '../constants/game';

import { calculateHandValue } from '../utils/cardUtils';

import {

    calculateTrueCount,

    getCardShortName,

    getHiLoCount,

} from '../utils/countingUtils';

import { buildShoe, shuffleArray } from '../utils/deckUtils';



const GameContext = createContext(null);



export const useGameContext = () => {

    const context = useContext(GameContext);

    if (!context) {

        throw new Error('useGameContext must be used within a GameProvider');

    }

    return context;

};



export const GameProvider = ({ children }) => {

    const [gameState, setGameState] = useState(null);

    const [alertMessage, setAlertMessage] = useState(null);



    const [deck, setDeck] = useState([]);

    const [shuffledDeck, setShuffledDeck] = useState([]);

    const [isDeckShuffled, setIsDeckShuffled] = useState(false);

    const [deckCount, setDeckCountState] = useState(DEFAULT_DECK_COUNT);

    const [totalCardsInShoe, setTotalCardsInShoe] = useState(getShoeSize(DEFAULT_DECK_COUNT));



    const [playerCards, setPlayerCards] = useState([]);

    const [dealerCards, setDealerCards] = useState([]);

    const [playerCount, setPlayerCount] = useState(0);

    const [dealerCount, setDealerCount] = useState(0);

    const [holeCard, setHoleCard] = useState(null);

    const [showHoleCard, setShowHoleCard] = useState(false);



    const [winner, setWinner] = useState(null);

    const [roundOver, setRoundOver] = useState(false);

    const [playerBust, setPlayerBust] = useState(false);

    const [dealerBust, setDealerBust] = useState(false);

    const [playerBlackJack, setPlayerBlackJack] = useState(false);

    const [dealerBlackJack, setDealerBlackJack] = useState(false);

    const [push, setPush] = useState(false);



    const [playerChips, setPlayerChips] = useState(DEFAULT_STARTING_CHIPS);

    const [currentBet, setCurrentBet] = useState(0);

    const [lastBetAmount, setLastBetAmount] = useState(DEFAULT_BET);

    const [betAmount, setBetAmount] = useState(DEFAULT_BET);



    const [deckWins, setDeckWins] = useState(0);

    const [deckLosses, setDeckLosses] = useState(0);

    const [deckPushes, setDeckPushes] = useState(0);

    const [deckBlackjacks, setDeckBlackjacks] = useState(0);



    const [runningCount, setRunningCount] = useState(0);

    const [cardsSeen, setCardsSeen] = useState(0);

    const [countEvents, setCountEvents] = useState([]);



    const roundBetRef = useRef(0);

    const deckRef = useRef([]);

    const shuffledDeckRef = useRef([]);

    const deckCountRef = useRef(DEFAULT_DECK_COUNT);

    const imagesLoadingRef = useRef(false);

    const imagesLoadedRef = useRef(false);

    const runningCountRef = useRef(0);

    const holeCardCountedRef = useRef(false);



    const updateShuffledDeck = (cards) => {

        shuffledDeckRef.current = cards;

        setShuffledDeck(cards);

    };



    const cardsRemaining = shuffledDeck.length;

    const decksRemaining = Math.max(Math.round((cardsRemaining / FULL_DECK_SIZE) * 10) / 10, 0.1);

    const trueCount = calculateTrueCount(runningCount, cardsRemaining, FULL_DECK_SIZE);

    const penetration = totalCardsInShoe

        ? Math.min(100, Math.round(((totalCardsInShoe - cardsRemaining) / totalCardsInShoe) * 100))

        : 0;



    useEffect(() => {

        if (!imagesLoadedRef.current && !imagesLoadingRef.current) {

            getImages();

        }

    }, []);



    useEffect(() => {

        if (gameState === GameState.GameConcluded) {

            setRoundOver(true);

        }

    }, [gameState]);



    useEffect(() => {

        if (alertMessage) {

            const timer = setTimeout(() => {

                setAlertMessage(null);

            }, 5000);



            return () => clearTimeout(timer);

        }

    }, [alertMessage]);



    const addLog = (message) => {

        console.log(`[Blackjack ${new Date().toLocaleTimeString()}] ${message}`);

    };



    const resetCounting = () => {

        runningCountRef.current = 0;

        holeCardCountedRef.current = false;

        setRunningCount(0);

        setCardsSeen(0);

        setCountEvents([]);

    };



    const recordCount = (card, label) => {

        if (!card) {

            return;

        }



        const delta = getHiLoCount(card);

        runningCountRef.current += delta;

        const nextRunningCount = runningCountRef.current;



        setRunningCount(nextRunningCount);

        setCardsSeen((prev) => prev + 1);

        setCountEvents((prev) => [

            ...prev.slice(-19),

            {

                id: `${Date.now()}-${Math.random()}`,

                label,

                cardName: getCardShortName(card),

                delta,

                runningCount: nextRunningCount,

            },

        ]);



        if (delta !== 0) {

            addLog(

                `Hi-Lo ${delta > 0 ? '+' : ''}${delta}: ${getCardShortName(card)} (${label}). Running: ${nextRunningCount}`,

            );

        } else {

            addLog(`Hi-Lo 0: ${getCardShortName(card)} (${label}). Running: ${nextRunningCount}`);

        }

    };



    const countVisibleCards = (cards, labelPrefix) => {

        cards.forEach((card, index) => {

            recordCount(card, `${labelPrefix} ${index + 1}`);

        });

    };



    const countHoleCardIfNeeded = (dealerHand) => {

        const hiddenCard = dealerHand?.[1];

        if (hiddenCard && !holeCardCountedRef.current) {

            recordCount(hiddenCard, 'Dealer hole card');

            holeCardCountedRef.current = true;

        }

    };



    const importAllImages = async () => {

        const modulePaths = import.meta.glob('../assets/images/*.{png,jpg,jpeg,js}');

        const imagePromises = Object.keys(modulePaths).map((path) => modulePaths[path]());

        return Promise.all(imagePromises);

    };



    const getImages = async () => {

        if (imagesLoadingRef.current || imagesLoadedRef.current) {

            return;

        }



        imagesLoadingRef.current = true;



        try {

            const images = await importAllImages();

            const imageDefaults = images.map((img) => img.default);

            if (imageDefaults.length === FULL_DECK_SIZE) {

                deckRef.current = imageDefaults;

                setDeck(imageDefaults);

                imagesLoadedRef.current = true;

                addLog('Cards loaded successfully.');

            } else {

                addLog(`Error: Loaded ${imageDefaults.length} cards, expected ${FULL_DECK_SIZE}.`);

            }

        } catch (error) {

            console.error('Error loading images:', error);

            addLog('Error loading card images.');

        } finally {

            imagesLoadingRef.current = false;

        }

    };



    const setDeckCount = (count) => {

        if (isDeckShuffled || !DECK_COUNT_OPTIONS.includes(count)) {

            return;

        }



        deckCountRef.current = count;

        setDeckCountState(count);

        setTotalCardsInShoe(getShoeSize(count));

        addLog(`Shoe size set to ${count} deck${count > 1 ? 's' : ''}.`);

    };



    const createShuffledShoe = () => {

        const template = deckRef.current.length > 0 ? deckRef.current : deck;

        const shoe = buildShoe(template, deckCountRef.current);

        return shuffleArray(shoe);

    };



    const shuffleDeck = () => {

        const sourceDeck = deckRef.current.length > 0 ? deckRef.current : deck;

        if (!sourceDeck || sourceDeck.length === 0) {

            addLog('No deck to shuffle.');

            return;

        }



        const shuffled = createShuffledShoe();

        const shoeSize = getShoeSize(deckCountRef.current);



        shuffledDeckRef.current = shuffled;

        setShuffledDeck(shuffled);

        setTotalCardsInShoe(shoeSize);

        setIsDeckShuffled(true);

        setGameState(null);

        setDeckWins(0);

        setDeckLosses(0);

        setDeckPushes(0);

        setDeckBlackjacks(0);

        resetCounting();

        addLog(`Shoe shuffled (${deckCountRef.current}-deck, ${shoeSize} cards). Session stats reset.`);

    };



    const dealInitialCards = (deckOverride) => {

        addLog('Dealing cards...');

        const sourceDeck = deckOverride ?? shuffledDeckRef.current;

        const deckCopy = [...sourceDeck];

        const pCards = [deckCopy.pop(), deckCopy.pop()];

        const dCards = [deckCopy.pop(), deckCopy.pop()];



        setPlayerCards(pCards);

        setDealerCards(dCards);

        setHoleCard(dCards[1]);

        holeCardCountedRef.current = false;

        updateShuffledDeck(deckCopy);



        countVisibleCards(pCards, 'Player card');

        recordCount(dCards[0], 'Dealer up card');



        const pCount = calculateHandValue(pCards);

        const dCount = calculateHandValue(dCards);

        setPlayerCount(pCount);

        setDealerCount(dCount);



        const playerBJ = pCount === 21;

        const dealerBJ = dCount === 21;



        if (playerBJ || dealerBJ) {

            setShowHoleCard(true);

            countHoleCardIfNeeded(dCards);

            setPlayerBlackJack(playerBJ);

            setDealerBlackJack(dealerBJ);

            if (playerBJ && dealerBJ) {

                setWinner('Push');

                setAlertMessage('Push! Both have Blackjack!');

                addLog('Push! Both have Blackjack.');

                handlePush();

            } else if (playerBJ) {

                setWinner(Who.Player);

                setAlertMessage('Player Blackjack!');

                addLog('Player wins with Blackjack!');

                handleWin(true);

            } else {

                setWinner(Who.Dealer);

                setAlertMessage('Dealer Blackjack!');

                addLog('Dealer wins with Blackjack.');

                handleLoss();

            }

            setGameState(GameState.GameConcluded);

        } else {

            addLog("Player's turn.");

            setGameState(GameState.PlayerPhase);

        }

    };



    const playerHit = () => {

        addLog('Player hits.');

        const deckCopy = [...shuffledDeckRef.current];

        const newCard = deckCopy.pop();

        const newPlayerCards = [...playerCards, newCard];

        setPlayerCards(newPlayerCards);

        updateShuffledDeck(deckCopy);

        recordCount(newCard, 'Player hit');



        const newPlayerCount = calculateHandValue(newPlayerCards);

        setPlayerCount(newPlayerCount);



        if (newPlayerCount > 21) {

            setPlayerBust(true);

            setWinner(Who.Dealer);

            setAlertMessage('Player busts! Dealer wins.');

            addLog(`Player busts with ${newPlayerCount}.`);

            handleLoss();

            setGameState(GameState.GameConcluded);

        }

    };



    const playerStay = () => {

        addLog('Player stays.');

        setGameState(GameState.DealerPhase);

    };



    const dealerTurn = () => {

        setShowHoleCard(true);

        addLog("Dealer's turn.");

        countHoleCardIfNeeded(dealerCards);



        let currentDealerCards = [...dealerCards];

        let currentDealerCount = calculateHandValue(currentDealerCards);

        let deckCopy = [...shuffledDeckRef.current];



        const play = () => {

            if (currentDealerCount < 17) {

                addLog(`Dealer has ${currentDealerCount} and hits.`);

                const newCard = deckCopy.pop();

                currentDealerCards.push(newCard);

                currentDealerCount = calculateHandValue(currentDealerCards);

                setDealerCards([...currentDealerCards]);

                setDealerCount(currentDealerCount);

                updateShuffledDeck([...deckCopy]);

                recordCount(newCard, 'Dealer hit');

                setTimeout(play, 1000);

            } else {

                addLog(`Dealer stands with ${currentDealerCount}.`);

                setDealerCount(currentDealerCount);

                if (currentDealerCount > 21) {

                    setDealerBust(true);

                    setWinner(Who.Player);

                    setAlertMessage('Dealer busts! Player wins.');

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

            setWinner('Push');

            setAlertMessage(`Push! Both have ${pCount}!`);

            addLog(`Push! Both have ${pCount}.`);

            handlePush();

        }

    };



    useEffect(() => {

        if (gameState === GameState.DealerPhase && !roundOver) {

            dealerTurn();

        }

    }, [gameState, roundOver]);



    const handleWin = (blackjack = false) => {

        const bet = roundBetRef.current;

        if (blackjack) {

            setDeckBlackjacks((prev) => prev + 1);

        }

        setDeckWins((prev) => prev + 1);

        if (bet > 0) {

            if (blackjack) {

                const winnings = Math.floor(bet * 1.5);

                setPlayerChips((prev) => prev + bet + winnings);

                addLog(`Blackjack! Won $${winnings} (3:2 payout). Total: $${bet + winnings}`);

            } else {

                const winnings = bet;

                setPlayerChips((prev) => prev + bet + winnings);

                addLog(`Player wins! Won $${winnings}. Total: $${bet + winnings}`);

            }

            setCurrentBet(0);

            roundBetRef.current = 0;

        }

        const message = blackjack ? 'Player wins with Blackjack!' : 'Player wins!';

        addLog(message);

    };



    const handleLoss = () => {

        const bet = roundBetRef.current;

        setDeckLosses((prev) => prev + 1);

        if (bet > 0) {

            addLog(`Player loses $${bet}.`);

            setCurrentBet(0);

            roundBetRef.current = 0;

        }

        addLog('Player loses.');

    };



    const handlePush = () => {

        const bet = roundBetRef.current;

        setDeckPushes((prev) => prev + 1);

        if (bet > 0) {

            setPlayerChips((prev) => prev + bet);

            addLog(`Push - bet of $${bet} returned.`);

            setCurrentBet(0);

            roundBetRef.current = 0;

        }

        addLog('Push - round is a draw.');

    };



    const placeBet = (betAmount) => {

        if (betAmount <= 0 || betAmount > playerChips) {

            addLog(`Invalid bet amount: $${betAmount}`);

            return false;

        }

        setPlayerChips((prev) => prev - betAmount);

        setCurrentBet(betAmount);

        setLastBetAmount(betAmount);

        roundBetRef.current = betAmount;

        addLog(`Bet placed: $${betAmount}`);

        return true;

    };



    const resetRoundState = () => {

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

        holeCardCountedRef.current = false;

    };



    const reshuffleIfLow = () => {

        const currentDeck = shuffledDeckRef.current;

        const threshold = getLowDeckThreshold(deckCountRef.current);



        if (currentDeck.length >= threshold) {

            return currentDeck;

        }



        const sourceDeck = deckRef.current.length > 0 ? deckRef.current : deck;

        if (sourceDeck.length === 0) {

            return currentDeck;

        }



        if (currentDeck.length > 0) {

            addLog(`Shoe is low (${currentDeck.length} cards), reshuffling ${deckCountRef.current}-deck shoe...`);

        }



        const shuffled = createShuffledShoe();

        updateShuffledDeck(shuffled);

        setTotalCardsInShoe(getShoeSize(deckCountRef.current));

        resetCounting();

        return shuffled;

    };



    const handleDeal = (betAmountOverride) => {

        const betToUse = betAmountOverride ?? roundBetRef.current ?? currentBet;



        if (betToUse <= 0) {

            setAlertMessage('Please place a bet before dealing cards.');

            return false;

        }



        if (betAmountOverride !== undefined) {

            if (betAmountOverride <= 0 || betAmountOverride > playerChips) {

                addLog(`Invalid bet amount: $${betAmountOverride}`);

                return false;

            }

            setPlayerChips((prev) => prev - betAmountOverride);

            setCurrentBet(betAmountOverride);

            setLastBetAmount(betAmountOverride);

            setBetAmount(betAmountOverride);

            roundBetRef.current = betAmountOverride;

            addLog(`Bet placed: $${betAmountOverride}`);

        }



        if (roundOver) {

            addLog('--- Starting New Round ---');

        }



        resetRoundState();

        const deckToUse = reshuffleIfLow();

        dealInitialCards(deckToUse);

        return true;

    };



    const placeBetAndDeal = (betAmount) => handleDeal(betAmount);



    const quickDeal = () => {

        const betToUse = Math.min(betAmount, playerChips);

        if (betToUse <= 0) {

            setAlertMessage('Not enough chips to place a bet.');

            return;

        }

        handleDeal(betToUse);

    };



    const resetGame = () => {

        addLog('--- Game Reset ---');

        setGameState(null);

        setAlertMessage(null);

        deckRef.current = [];

        shuffledDeckRef.current = [];

        deckCountRef.current = DEFAULT_DECK_COUNT;

        setDeckCountState(DEFAULT_DECK_COUNT);

        setDeck([]);

        updateShuffledDeck([]);

        setTotalCardsInShoe(getShoeSize(DEFAULT_DECK_COUNT));

        setIsDeckShuffled(false);

        setWinner(null);

        setRoundOver(false);

        setPlayerCards([]);

        setDealerCards([]);

        setPlayerCount(0);

        setDealerCount(0);

        setHoleCard(null);

        setShowHoleCard(false);

        setPlayerChips(DEFAULT_STARTING_CHIPS);

        setCurrentBet(0);

        setLastBetAmount(DEFAULT_BET);

        setBetAmount(DEFAULT_BET);

        roundBetRef.current = 0;

        setDeckWins(0);

        setDeckLosses(0);

        setDeckPushes(0);

        setDeckBlackjacks(0);

        resetCounting();

        imagesLoadedRef.current = false;

        imagesLoadingRef.current = false;

        getImages();

    };



    const value = {

        gameState,

        setGameState,

        alertMessage,

        setAlertMessage,

        addLog,

        deck,

        setDeck,

        shuffledDeck,

        setShuffledDeck,

        isDeckShuffled,

        setIsDeckShuffled,

        deckCount,

        setDeckCount,

        deckCountOptions: DECK_COUNT_OPTIONS,

        totalCardsInShoe,

        playerCards,

        dealerCards,

        playerCount,

        dealerCount,

        showHoleCard,

        winner,

        setWinner,

        roundOver,

        shuffleDeck,

        resetGame,

        handleDeal,

        playerHit,

        playerStay,

        placeBet,

        placeBetAndDeal,

        playerChips,

        setPlayerChips,

        currentBet,

        setCurrentBet,

        lastBetAmount,

        betAmount,

        setBetAmount,

        quickDeal,

        deckWins,

        deckLosses,

        deckPushes,

        deckBlackjacks,

        cardsRemaining,

        decksRemaining,

        penetration,

        runningCount,

        trueCount,

        countEvents,

        cardsSeen,

        handleWin,

        handleLoss,

        handlePush,

    };



    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;

};



export default GameProvider;


