import React, {
    createContext,
    startTransition,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
import { HandStatus, TABLE_RULES } from '../constants/rules';
import { calculateHandValue } from '../utils/cardUtils';
import {
    calculateTrueCount,
    getCardShortName,
    getHiLoCount,
} from '../utils/countingUtils';
import { buildShoe, shuffleArray } from '../utils/deckUtils';
import { preloadGameTextures } from '../utils/texturePreload';
import { yieldToMain, yieldToPaint } from '../utils/yieldToMain';
import { TableVisualContext } from './tableVisualContext';
import {
    canSplitHand,
    createPlayerHand,
    formatHandTotals,
    getHandValue,
    isAcePair,
} from '../utils/handUtils';

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
    const [cardsRemaining, setCardsRemaining] = useState(0);
    const [isDeckShuffled, setIsDeckShuffled] = useState(false);
    const [boardBusy, setBoardBusy] = useState(false);
    const [boardBusyMessage, setBoardBusyMessage] = useState('');
    const [deckCount, setDeckCountState] = useState(DEFAULT_DECK_COUNT);
    const [totalCardsInShoe, setTotalCardsInShoe] = useState(getShoeSize(DEFAULT_DECK_COUNT));

    const [playerHands, setPlayerHands] = useState([]);
    const [activeHandIndex, setActiveHandIndex] = useState(0);
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerCount, setDealerCount] = useState(0);
    const [showHoleCard, setShowHoleCard] = useState(false);

    const [winner, setWinner] = useState(null);
    const [roundOver, setRoundOver] = useState(false);
    const [playerBust, setPlayerBust] = useState(false);
    const [dealerBust, setDealerBust] = useState(false);
    const [playerBlackJack, setPlayerBlackJack] = useState(false);
    const [dealerBlackJack, setDealerBlackJack] = useState(false);
    const [push, setPush] = useState(false);
    const [handResults, setHandResults] = useState([]);

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
    const cardsSeenRef = useRef(0);
    const pendingCountEventsRef = useRef([]);
    const holeCardCountedRef = useRef(false);
    const playerHandsRef = useRef([]);
    const dealerCardsRef = useRef([]);
    const activeHandIndexRef = useRef(0);
    const boardBusyRef = useRef(false);

    const updateShuffledDeck = (cards) => {
        shuffledDeckRef.current = cards;
        setCardsRemaining(cards.length);
    };

    const takeCard = () => shuffledDeckRef.current.pop();

    const syncShoeCount = () => {
        setCardsRemaining(shuffledDeckRef.current.length);
    };

    const syncPlayerHands = (hands) => {
        playerHandsRef.current = hands;
        setPlayerHands(hands);
    };

    const decksRemaining = Math.max(Math.round((cardsRemaining / FULL_DECK_SIZE) * 10) / 10, 0.1);
    const trueCount = calculateTrueCount(runningCount, cardsRemaining, FULL_DECK_SIZE);
    const penetration = totalCardsInShoe
        ? Math.min(100, Math.round(((totalCardsInShoe - cardsRemaining) / totalCardsInShoe) * 100))
        : 0;

    const activeHand = playerHands[activeHandIndex] ?? null;
    const playerCards = activeHand?.cards ?? [];
    const playerCount = activeHand ? getHandValue(activeHand) : 0;
    const playerCountDisplay = formatHandTotals(playerHands);
    const canSplit =
        gameState === GameState.PlayerPhase &&
        activeHand &&
        canSplitHand(activeHand, playerHands, playerChips, TABLE_RULES);

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
            const timer = setTimeout(() => setAlertMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const addLog = (message) => {
        console.log(`[Blackjack ${new Date().toLocaleTimeString()}] ${message}`);
    };

    const resetCounting = () => {
        runningCountRef.current = 0;
        cardsSeenRef.current = 0;
        pendingCountEventsRef.current = [];
        holeCardCountedRef.current = false;
        setRunningCount(0);
        setCardsSeen(0);
        setCountEvents([]);
    };

    const flushCounts = () => {
        const nextRunningCount = runningCountRef.current;
        const nextCardsSeen = cardsSeenRef.current;
        const pending = pendingCountEventsRef.current;
        pendingCountEventsRef.current = [];

        startTransition(() => {
            setRunningCount(nextRunningCount);
            setCardsSeen(nextCardsSeen);
            if (pending.length > 0) {
                setCountEvents((prev) => [...prev, ...pending].slice(-20));
            }
        });
    };

    const recordCount = (card, label) => {
        if (!card) {
            return;
        }

        const delta = getHiLoCount(card);
        runningCountRef.current += delta;
        cardsSeenRef.current += 1;
        pendingCountEventsRef.current.push({
            id: `${Date.now()}-${Math.random()}`,
            label,
            cardName: getCardShortName(card),
            delta,
            runningCount: runningCountRef.current,
        });

        if (delta !== 0) {
            addLog(
                `Hi-Lo ${delta > 0 ? '+' : ''}${delta}: ${getCardShortName(card)} (${label}). Running: ${runningCountRef.current}`,
            );
        } else {
            addLog(`Hi-Lo 0: ${getCardShortName(card)} (${label}). Running: ${runningCountRef.current}`);
        }
    };

    const runWithBoardBusy = async (message, work) => {
        const alreadyBusy = boardBusyRef.current;
        if (!alreadyBusy) {
            boardBusyRef.current = true;
            setBoardBusy(true);
            setBoardBusyMessage(message);
            await yieldToMain();
        }

        try {
            await work();
            await yieldToPaint();
        } finally {
            if (!alreadyBusy) {
                boardBusyRef.current = false;
                setBoardBusy(false);
                setBoardBusyMessage('');
            }
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
                preloadGameTextures(imageDefaults);
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
        runWithBoardBusy('Shuffling shoe…', async () => {
            const sourceDeck = deckRef.current.length > 0 ? deckRef.current : deck;
            if (!sourceDeck || sourceDeck.length === 0) {
                addLog('No deck to shuffle.');
                return;
            }

            const shuffled = createShuffledShoe();
            const shoeSize = getShoeSize(deckCountRef.current);

            shuffledDeckRef.current = shuffled;
            setCardsRemaining(shuffled.length);
            setTotalCardsInShoe(shoeSize);
            setIsDeckShuffled(true);
            setGameState(null);
            setDeckWins(0);
            setDeckLosses(0);
            setDeckPushes(0);
            setDeckBlackjacks(0);
            resetCounting();
            addLog(`Shoe shuffled (${deckCountRef.current}-deck, ${shoeSize} cards). Session stats reset.`);
        });
    };

    const handleHandWin = (hand, isBlackjack = false) => {
        const bet = hand.bet;
        setDeckWins((prev) => prev + 1);
        if (isBlackjack) {
            setDeckBlackjacks((prev) => prev + 1);
            const winnings = Math.floor(bet * 1.5);
            setPlayerChips((prev) => prev + bet + winnings);
            addLog(`Hand won with Blackjack! +$${winnings} on $${bet}.`);
            return { outcome: 'blackjack', amount: winnings };
        }
        setPlayerChips((prev) => prev + bet + bet);
        addLog(`Hand won $${bet}.`);
        return { outcome: 'win', amount: bet };
    };

    const handleHandLoss = (hand) => {
        setDeckLosses((prev) => prev + 1);
        addLog(`Hand lost $${hand.bet}.`);
        return { outcome: 'loss', amount: -hand.bet };
    };

    const handleHandPush = (hand) => {
        setDeckPushes((prev) => prev + 1);
        setPlayerChips((prev) => prev + hand.bet);
        addLog(`Hand push — $${hand.bet} returned.`);
        return { outcome: 'push', amount: 0 };
    };

    const concludeAllBust = (hands) => {
        const results = hands.map((hand) => handleHandLoss(hand));
        setHandResults(results);
        setPlayerBust(true);
        setWinner(Who.Dealer);
        setAlertMessage('All hands bust — dealer wins.');
        setCurrentBet(0);
        roundBetRef.current = 0;
        setGameState(GameState.GameConcluded);
    };

    /** Deal the opening card when a split hand becomes active (standard Vegas flow). */
    const dealSplitOpeningCard = (hands, handIndex) => {
        const hand = hands[handIndex];
        if (!hand?.awaitingSplitDeal || hand.status !== HandStatus.Playing) {
            return false;
        }

        const newCard = takeCard();
        hand.cards.push(newCard);
        hand.awaitingSplitDeal = false;
        syncShoeCount();
        recordCount(newCard, `Split hand ${handIndex + 1} deal`);

        const value = calculateHandValue(hand.cards);
        if (value > 21) {
            hand.status = HandStatus.Bust;
            handleHandLoss(hand);
            addLog(`Hand ${handIndex + 1} busts on the deal with ${value}.`);
            return true;
        }

        addLog(`Hand ${handIndex + 1} dealt — now ${value}.`);
        return false;
    };

    const finishSplitHandA = (hands, handIndex) => {
        const handA = hands[handIndex];
        const value = calculateHandValue(handA.cards);

        if (value > 21) {
            handA.status = HandStatus.Bust;
            handleHandLoss(handA);
            addLog(`Hand 1 busts on the split deal with ${value}.`);
            syncPlayerHands(hands);
            advancePlayerTurn(hands);
            return true;
        }

        syncPlayerHands(hands);
        activeHandIndexRef.current = handIndex;
        setActiveHandIndex(handIndex);
        addLog(`Split! Hand 1 plays with ${value}.`);
        return false;
    };

    const advancePlayerTurn = (hands) => {
        const current = activeHandIndexRef.current;

        for (let i = current + 1; i < hands.length; i++) {
            if (hands[i].status !== HandStatus.Playing) {
                continue;
            }

            const bustOnDeal = dealSplitOpeningCard(hands, i);
            syncPlayerHands(hands);

            if (bustOnDeal) {
                activeHandIndexRef.current = i;
                advancePlayerTurn(hands);
                return;
            }

            activeHandIndexRef.current = i;
            setActiveHandIndex(i);
            addLog(`Hand ${i + 1} — your turn.`);
            return;
        }

        const surviving = hands.filter((hand) => hand.status !== HandStatus.Bust);
        if (surviving.length === 0) {
            concludeAllBust(hands);
            return;
        }

        addLog('Player done — dealer turns.');
        setGameState(GameState.DealerPhase);
    };

    const dealInitialCards = () => {
        addLog('Dealing cards...');

        const pCards = [takeCard(), takeCard()];
        const dCards = [takeCard(), takeCard()];
        const initialBet = roundBetRef.current;

        const hands = [createPlayerHand(pCards, initialBet)];
        syncPlayerHands(hands);
        activeHandIndexRef.current = 0;
        setActiveHandIndex(0);

        setDealerCards(dCards);
        dealerCardsRef.current = dCards;
        holeCardCountedRef.current = false;
        syncShoeCount();

        countVisibleCards(pCards, 'Player card');
        recordCount(dCards[0], 'Dealer up card');

        const pCount = calculateHandValue(pCards);
        const dCount = calculateHandValue(dCards);
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
                handleHandPush(hands[0]);
                setHandResults([{ outcome: 'push', amount: 0 }]);
            } else if (playerBJ) {
                setWinner(Who.Player);
                setAlertMessage('Player Blackjack!');
                addLog('Player wins with Blackjack!');
                handleHandWin(hands[0], true);
                setHandResults([{ outcome: 'blackjack', amount: Math.floor(initialBet * 1.5) }]);
            } else {
                setWinner(Who.Dealer);
                setAlertMessage('Dealer Blackjack!');
                addLog('Dealer wins with Blackjack.');
                handleHandLoss(hands[0]);
                setHandResults([{ outcome: 'loss', amount: -initialBet }]);
            }

            setCurrentBet(0);
            roundBetRef.current = 0;
            setGameState(GameState.GameConcluded);
        } else {
            addLog("Player's turn.");
            setGameState(GameState.PlayerPhase);
        }

        flushCounts();
    };

    const playerHit = () => {
        const hands = playerHandsRef.current.map((hand) => ({
            ...hand,
            cards: [...hand.cards],
        }));
        const handIndex = activeHandIndexRef.current;
        const hand = hands[handIndex];

        if (!hand || hand.status !== HandStatus.Playing) {
            return;
        }

        addLog(`Hand ${handIndex + 1} hits.`);

        const newCard = takeCard();
        hand.cards.push(newCard);
        syncShoeCount();
        recordCount(newCard, `Player hand ${handIndex + 1} hit`);

        const newValue = calculateHandValue(hand.cards);

        if (newValue > 21) {
            hand.status = HandStatus.Bust;
            addLog(`Hand ${handIndex + 1} busts with ${newValue}.`);
            handleHandLoss(hand);
            syncPlayerHands(hands);
            advancePlayerTurn(hands);
            flushCounts();
            return;
        }

        syncPlayerHands(hands);
        flushCounts();
    };

    const playerStay = () => {
        const hands = playerHandsRef.current.map((hand) => ({
            ...hand,
            cards: [...hand.cards],
        }));
        const handIndex = activeHandIndexRef.current;
        const hand = hands[handIndex];

        if (!hand || hand.status !== HandStatus.Playing) {
            return;
        }

        hand.status = HandStatus.Stand;
        addLog(`Hand ${handIndex + 1} stays at ${calculateHandValue(hand.cards)}.`);
        syncPlayerHands(hands);
        advancePlayerTurn(hands);
        flushCounts();
    };

    const playerSplit = () => {
        runWithBoardBusy('Splitting hands…', async () => {
            const hands = playerHandsRef.current.map((hand) => ({
                ...hand,
                cards: [...hand.cards],
            }));
            const handIndex = activeHandIndexRef.current;
            const hand = hands[handIndex];

            if (!canSplitHand(hand, hands, playerChips, TABLE_RULES)) {
                return;
            }

            const splitBet = hand.bet;
            setPlayerChips((prev) => prev - splitBet);
            setCurrentBet((prev) => prev + splitBet);
            roundBetRef.current += splitBet;

            const [cardA, cardB] = hand.cards;
            const handA = createPlayerHand([cardA], splitBet);
            const handB = createPlayerHand([cardB], splitBet, { awaitingSplitDeal: true });
            hands.splice(handIndex, 1, handA, handB);

            if (isAcePair(handA) && TABLE_RULES.splitAcesOneCard) {
                handA.cards.push(takeCard());
                handB.cards.push(takeCard());
                handB.awaitingSplitDeal = false;
                recordCount(handA.cards[1], 'Split ace hand 1');
                recordCount(handB.cards[1], 'Split ace hand 2');
                handA.status = HandStatus.Stand;
                handB.status = HandStatus.Stand;
                syncShoeCount();
                syncPlayerHands(hands);
                activeHandIndexRef.current = 0;
                setActiveHandIndex(0);
                addLog('Split aces — one card each, standing.');
                setGameState(GameState.DealerPhase);
                flushCounts();
                return;
            }

            const splitCard = takeCard();
            handA.cards.push(splitCard);
            recordCount(splitCard, 'Split hand 1 deal');
            syncShoeCount();
            finishSplitHandA(hands, handIndex);
            flushCounts();
        });
    };

    const resolveHandsAgainstDealer = (dealerFinalCount, dealerBusted) => {
        const hands = playerHandsRef.current;
        const results = [];

        hands.forEach((hand, index) => {
            if (hand.status === HandStatus.Bust) {
                results.push({ outcome: 'loss', amount: -hand.bet });
                return;
            }

            const pCount = getHandValue(hand);

            if (dealerBusted) {
                results.push(handleHandWin(hand, false));
            } else if (pCount > dealerFinalCount) {
                results.push(handleHandWin(hand, false));
            } else if (pCount < dealerFinalCount) {
                results.push(handleHandLoss(hand));
            } else {
                results.push(handleHandPush(hand));
            }

            addLog(`Hand ${index + 1}: ${pCount} vs dealer ${dealerFinalCount}.`);
        });

        setHandResults(results);
        setCurrentBet(0);
        roundBetRef.current = 0;

        const wins = results.filter((r) => r.outcome === 'win' || r.outcome === 'blackjack').length;
        const losses = results.filter((r) => r.outcome === 'loss').length;
        const pushes = results.filter((r) => r.outcome === 'push').length;

        if (wins > 0 && losses === 0) {
            setWinner(Who.Player);
            setAlertMessage(wins === hands.length ? 'You win!' : 'You win some hands!');
        } else if (losses > 0 && wins === 0) {
            setWinner(Who.Dealer);
            setAlertMessage('Dealer wins.');
        } else if (wins > 0 && losses > 0) {
            setWinner('Mixed');
            setAlertMessage(`Split result — ${wins} won, ${losses} lost${pushes ? `, ${pushes} push` : ''}.`);
        } else {
            setWinner('Push');
            setAlertMessage('Push.');
        }
    };

    const dealerTurn = () => {
        const startingCards = dealerCardsRef.current;
        setShowHoleCard(true);
        addLog("Dealer's turn.");
        countHoleCardIfNeeded(startingCards);
        flushCounts();

        let currentDealerCards = [...startingCards];
        let currentDealerCount = calculateHandValue(currentDealerCards);

        const play = () => {
            if (currentDealerCount < TABLE_RULES.dealerStandsOn) {
                addLog(`Dealer has ${currentDealerCount} and hits.`);

                const newCard = takeCard();
                currentDealerCards.push(newCard);
                currentDealerCount = calculateHandValue(currentDealerCards);
                dealerCardsRef.current = currentDealerCards;
                setDealerCards([...currentDealerCards]);
                setDealerCount(currentDealerCount);
                syncShoeCount();
                recordCount(newCard, 'Dealer hit');
                flushCounts();
                setTimeout(play, 1000);
            } else {
                addLog(`Dealer stands with ${currentDealerCount}.`);
                setDealerCount(currentDealerCount);

                if (currentDealerCount > 21) {
                    setDealerBust(true);
                    addLog(`Dealer busts with ${currentDealerCount}.`);
                    resolveHandsAgainstDealer(currentDealerCount, true);
                } else {
                    resolveHandsAgainstDealer(currentDealerCount, false);
                }

                setGameState(GameState.GameConcluded);
            }
        };

        setTimeout(play, 1000);
    };

    useEffect(() => {
        if (gameState === GameState.DealerPhase && !roundOver) {
            dealerTurn();
        }
    }, [gameState, roundOver]);

    const placeBet = (amount) => {
        if (amount <= 0 || amount > playerChips) {
            addLog(`Invalid bet amount: $${amount}`);
            return false;
        }

        setPlayerChips((prev) => prev - amount);
        setCurrentBet(amount);
        setLastBetAmount(amount);
        roundBetRef.current = amount;
        addLog(`Bet placed: $${amount}`);
        return true;
    };

    const resetRoundState = () => {
        setWinner(null);
        setRoundOver(false);
        setAlertMessage(null);
        syncPlayerHands([]);
        activeHandIndexRef.current = 0;
        setActiveHandIndex(0);
        setDealerCards([]);
        dealerCardsRef.current = [];
        setDealerCount(0);
        setShowHoleCard(false);
        setPlayerBust(false);
        setDealerBust(false);
        setPlayerBlackJack(false);
        setDealerBlackJack(false);
        setPush(false);
        setHandResults([]);
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
        }

        runWithBoardBusy('Dealing cards…', async () => {
            if (betAmountOverride !== undefined) {
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
            reshuffleIfLow();
            dealInitialCards();
        });

        return true;
    };

    const placeBetAndDeal = (amount) => handleDeal(amount);

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
        syncPlayerHands([]);
        activeHandIndexRef.current = 0;
        setActiveHandIndex(0);
        setDealerCards([]);
        dealerCardsRef.current = [];
        setDealerCount(0);
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
        setHandResults([]);
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
        isDeckShuffled,
        setIsDeckShuffled,
        deckCount,
        setDeckCount,
        deckCountOptions: DECK_COUNT_OPTIONS,
        totalCardsInShoe,
        playerHands,
        activeHandIndex,
        playerCards,
        playerCount,
        playerCountDisplay,
        dealerCards,
        dealerCount,
        showHoleCard,
        winner,
        setWinner,
        roundOver,
        handResults,
        canSplit,
        shuffleDeck,
        resetGame,
        handleDeal,
        playerHit,
        playerStay,
        playerSplit,
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
        boardBusy,
        boardBusyMessage,
        tableRules: TABLE_RULES,
    };

    const tableVisual = useMemo(
        () => ({
            playerHands,
            dealerCards,
            showHoleCard,
            cardsRemaining: cardsRemaining > 0 ? Math.max(8, Math.ceil(cardsRemaining / 8) * 8) : 0,
            totalCardsInShoe,
            isDeckShuffled,
            boardBusy,
            boardBusyMessage,
        }),
        [
            playerHands,
            dealerCards,
            showHoleCard,
            cardsRemaining,
            totalCardsInShoe,
            isDeckShuffled,
            boardBusy,
            boardBusyMessage,
        ],
    );

    return (
        <GameContext.Provider value={value}>
            <TableVisualContext.Provider value={tableVisual}>
                {children}
            </TableVisualContext.Provider>
        </GameContext.Provider>
    );
};

export default GameProvider;
