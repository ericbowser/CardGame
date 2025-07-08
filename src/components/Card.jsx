import React, { useEffect, useState } from "react";
import facedown from "../assets/facedown4.jpg";
import { Who, Action, GameState } from '../Utils';

function Card({
                  shuffledDeck = [],
                  addLog,
                  setAlertMessage,
                  setGameState,
                  gameState,
                  setWinner
              }) {
    // Card state
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [cardsSet, setCardsSet] = useState(false);
    const [holeCard, setHoleCard] = useState(null);
    const [showHoleCard, setShowHoleCard] = useState(false);

    // Game state
    const [playerBlackJack, setPlayerBlackJack] = useState(false);
    const [dealerBlackJack, setDealerBlackJack] = useState(false);
    const [playerBust, setPlayerBust] = useState(false);
    const [dealerBust, setDealerBust] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);
    const [dealerCount, setDealerCount] = useState(0);
    // Use local winner state when setWinner is not provided
    const [localWinner, setLocalWinner] = useState(null);

    // Determine which setter to use
    const updateWinner = (value) => {
        if (setWinner) {
            setWinner(value);
        }
        setLocalWinner(value);
    };
    const [push, setPush] = useState(false);
    const [roundOver, setRoundOver] = useState(false);

    // Player actions
    const [playerHits, setPlayerHits] = useState(0);

    // Betting state (to be connected with a betting system later)
    const [playerChips, setPlayerChips] = useState(1000);
    const [currentBet, setCurrentBet] = useState(0);

    // Auto-play dealer's turn according to house rules
    useEffect(() => {
        if (gameState === GameState.DealerPhase && !dealerBlackJack && !playerBlackJack && !playerBust) {
            setShowHoleCard(true);

            // Dealer must hit on 16 or less, stand on 17 or more
            if (dealerCount < 17) {
                // Use setTimeout to create a slight delay for better UX
                const timer = setTimeout(() => {
                    autoPlayDealer();
                }, 1000);

                return () => clearTimeout(timer);
            } else {
                addLog(`Dealer stands with ${dealerCount}.`);
                compareScores();
            }
        }
    }, [gameState, dealerCount]);

    // Handle bust scenarios
    useEffect(() => {
        if (playerBust && !dealerBust) {
            updateWinner(Who.Dealer);
            setAlertMessage("Player busts! Dealer wins.");
            addLog("Player busts! Dealer wins.");
            setGameState(GameState.GameConcluded);
            setRoundOver(true);
        }
        if (!playerBust && dealerBust) {
            updateWinner(Who.Player);
            setAlertMessage("Dealer busts! Player wins.");
            addLog("Dealer busts! Player wins.");
            setGameState(GameState.GameConcluded);
            setRoundOver(true);
        }
    }, [dealerBust, playerBust]);

    // Handle BlackJack scenarios
    useEffect(() => {
        if (dealerBlackJack && playerBlackJack) {
            setPush(true);
            updateWinner("Push");
            setAlertMessage("Push! Both have BlackJack!");
            addLog("Push! Both player and dealer have BlackJack.");
            setGameState(GameState.GameConcluded);
            setRoundOver(true);
        } else if (playerBlackJack && !dealerBlackJack) {
            setWinner(Who.Player);
            setAlertMessage("Player BlackJack!");
            addLog("Player wins with BlackJack!");
            setGameState(GameState.GameConcluded);
            setRoundOver(true);
        } else if (dealerBlackJack && !playerBlackJack) {
            setWinner(Who.Dealer);
            setAlertMessage("Dealer BlackJack!");
            addLog("Dealer wins with BlackJack!");
            setGameState(GameState.GameConcluded);
            setRoundOver(true);
        }
    }, [dealerBlackJack, playerBlackJack]);

    // Initial card setup
    useEffect(() => {
        if (playerCards.length === 0 && dealerCards.length === 0 && gameState === GameState.CardsDealt) {
            dealInitialCards();
        }

        // Check for initial BlackJack
        if (playerCards.length === 2 && dealerCards.length === 2 && cardsSet) {
            addLog('Dealing Cards...');
            addLog('Checking for BlackJack...');

            // Calculate initial hands
            setDealerHand();
            setPlayerHand();

            // Check for blackjack
            checkForBlackJack(dealerCards, Who.Dealer);
            checkForBlackJack(playerCards, Who.Player);

            // If no blackjack, continue to player phase
            if (!playerBlackJack && !dealerBlackJack) {
                addLog("No BlackJack. Player's turn.");
                setGameState(GameState.PlayerPhase);
            }
        }
    }, [playerCards, dealerCards, cardsSet, gameState]);

    // Deal initial cards
    const dealInitialCards = () => {
        if (playerCards.length === 0 && dealerCards.length === 0 && !cardsSet && shuffledDeck.length >= 4) {
            let player = [];
            let dealer = [];

            const playerCard1 = shuffledDeck.pop();
            const dealerCard1 = shuffledDeck.pop();
            const playerCard2 = shuffledDeck.pop();
            const dealerCard2 = shuffledDeck.pop();

            player.push(playerCard1);
            player.push(playerCard2);

            dealer.push(dealerCard1);
            dealer.push(dealerCard2);

            setDealerCards(dealer);
            setPlayerCards(player);
            setHoleCard(dealerCard2);
            setCardsSet(true);

            addLog(`Player receives cards`);
            addLog(`Dealer shows one card and has one face-down card`);
        }
    };

    // Calculate dealer's hand value - improved version
    function setDealerHand() {
        let total = 0;
        let aces = 0;

        dealerCards.forEach(card => {
            if (card.includes('ace')) {
                aces++;
            } else if (card.includes('king') || card.includes('queen') || card.includes('jack')) {
                total += 10;
            } else if (card.includes('10')) {
                total += 10;
            } else {
                // Extract number from card name
                const match = card.match(/(\d+)_of/);
                if (match && match[1]) {
                    total += parseInt(match[1]);
                }
            }
        });

        // Add aces (1 or 11 each) - always add aces last for proper counting
        for (let i = 0; i < aces; i++) {
            if (total + 11 <= 21) {
                total += 11;
            } else {
                total += 1;
            }
        }

        setDealerCount(total);

        if (total > 21) {
            setDealerBust(true);
        }
    }

    // Calculate player's hand value - improved version
    function setPlayerHand() {
        let total = 0;
        let aces = 0;

        playerCards.forEach(card => {
            if (card.includes('ace')) {
                aces++;
            } else if (card.includes('king') || card.includes('queen') || card.includes('jack')) {
                total += 10;
            } else if (card.includes('10')) {
                total += 10;
            } else {
                // Extract number from card name
                const match = card.match(/(\d+)_of/);
                if (match && match[1]) {
                    total += parseInt(match[1]);
                }
            }
        });

        // Add aces (1 or 11 each) - always add aces last for proper counting
        for (let i = 0; i < aces; i++) {
            if (total + 11 <= 21) {
                total += 11;
            } else {
                total += 1;
            }
        }

        setPlayerCount(total);

        if (total > 21) {
            setPlayerBust(true);
        }
    }

    // Automated dealer play
    const autoPlayDealer = () => {
        // Show the hole card when dealer plays
        setShowHoleCard(true);

        if (dealerCount < 17) {
            addLog("Dealer hits");
            const card = shuffledDeck.pop();
            const newDealerCards = [...dealerCards, card];
            setDealerCards(newDealerCards);

            // Recalculate dealer's hand
            setTimeout(() => {
                setDealerHand();
            }, 200);
        } else {
            addLog("Dealer stays");
            compareScores();
        }
    };

    // Player actions
    const hitOrStayPlayer = (choice) => {
        if (choice === Action.Hit) {
            addLog("Player hits");
            const card = shuffledDeck.pop();
            const newPlayerCards = [...playerCards, card];
            setPlayerCards(newPlayerCards);
            setPlayerHits(playerHits + 1);

            // Recalculate player's hand
            setTimeout(() => {
                setPlayerHand();
            }, 200);
        } else if (choice === Action.Stay) {
            addLog("Player stays");
            setGameState(GameState.DealerPhase);
        }
    };

    // Compare scores at the end of the round
    const compareScores = () => {
        if (!playerBust && !dealerBust) {
            if (playerCount > dealerCount) {
                setWinner(Who.Player);
                setAlertMessage(`Player wins with ${playerCount}!`);
                addLog(`Player wins with ${playerCount} vs dealer's ${dealerCount}.`);
            } else if (dealerCount > playerCount) {
                setWinner(Who.Dealer);
                setAlertMessage(`Dealer wins with ${dealerCount}!`);
                addLog(`Dealer wins with ${dealerCount} vs player's ${playerCount}.`);
            } else {
                setPush(true);
                setWinner("Push");
                setAlertMessage(`Push! Both have ${playerCount}!`);
                addLog(`Push! Both have ${playerCount}.`);
            }
        }

        setGameState(GameState.GameConcluded);
    };

    // Check for blackjack (Ace + 10-value card)
    function checkForBlackJack(cards, who) {
        if (cards.length !== 2) return false;

        // Check if one card is an ace
        const hasAce = cards.some(card => card.includes('ace'));

        // Check if one card is a 10-value card (10, J, Q, K)
        const hasFaceCard = cards.some(card => {
            return card.includes('10') ||
              card.includes('jack') ||
              card.includes('queen') ||
              card.includes('king');
        });

        // If both conditions are true, it's a blackjack
        if (hasAce && hasFaceCard) {
            if (who === Who.Dealer) {
                setDealerBlackJack(true);
            } else if (who === Who.Player) {
                setPlayerBlackJack(true);
            }
            return true;
        }

        return false;
    }

    // Start a new round
    const startNewRound = () => {
        // Reset all game state
        setPlayerCards([]);
        setDealerCards([]);
        setCardsSet(false);
        setHoleCard(null);
        setShowHoleCard(false);
        setPlayerBlackJack(false);
        setDealerBlackJack(false);
        setPlayerBust(false);
        setDealerBust(false);
        setPlayerCount(0);
        setDealerCount(0);
        setWinner(null);
        setPush(false);
        setRoundOver(false);
        setPlayerHits(0);
        setCurrentBet(0);

        // Reset game state
        setGameState(null);
        addLog("Ready for a new round");
    };

    // Render player cards with responsive layout
    const getPlayerCards = () => {
        return playerCards.map((card, index) => (
          <div
            key={`player-card-${index}`}
            className="inline-block relative transition-all duration-300 rounded-md"
            style={{
                marginLeft: index > 0 ? `-60px` : '0',
                zIndex: index
            }}
          >
              <img
                src={card}
                alt={`Player card ${index + 1}`}
                className="w-32 h-auto rounded-md shadow-lg"
              />
          </div>
        ));
    };

    // Render dealer cards with responsive layout
    const getDealerCards = () => {
        return dealerCards.map((card, index) => {
            const isHoleCard = index === 1;

            return (
              <div
                key={`dealer-card-${index}`}
                className="inline-block relative transition-all duration-300 rounded-md"
                style={{
                    marginLeft: index > 0 ? `-60px` : '0',
                    zIndex: index
                }}
              >
                  <img
                    src={isHoleCard && !showHoleCard ? facedown : card}
                    alt={`Dealer card ${index + 1}`}
                    className="w-32 h-auto rounded-md shadow-lg"
                  />
              </div>
            );
        });
    };

    return (
      <div className="w-full max-w-4xl mx-auto p-4">
          {/* Game status */}
          <div className="mb-4 flex justify-between items-center">
              <div>
                    <span className="text-lg text-white font-semibold">
                        Player: ${playerChips}
                    </span>
              </div>

              {localWinner && gameState === GameState.GameConcluded && (
                <div className="text-center p-2 bg-opacity-80 rounded">
                        <span className={`text-2xl font-bold ${
                          (localWinner || winner) === Who.Player ? 'text-green-400' :
                            (localWinner || winner) === Who.Dealer ? 'text-red-400' :
                              'text-yellow-400'
                        }`}>
                            {(localWinner || winner) === "Push" ? "Push!" : `${(localWinner || winner)} Wins!`}
                        </span>
                </div>
              )}

              <div>
                    <span className="text-lg text-white font-semibold">
                        Dealer: {showHoleCard ? dealerCount : '?'}
                    </span>
                  <span className="mx-4 text-lg text-white font-semibold">
                        Player: {playerCount}
                    </span>
              </div>
          </div>

          {/* Dealer's cards */}
          <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Dealer's Hand</h2>
              <div className="flex justify-center items-center h-48">
                  {getDealerCards()}
              </div>
          </div>

          {/* Player's cards */}
          <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Player's Hand</h2>
              <div className="flex justify-center items-center h-48">
                  {getPlayerCards()}
              </div>
          </div>

          {/* Game controls */}
          <div className="flex justify-center space-x-4 mt-6">
              {gameState === GameState.PlayerPhase && (
                <>
                    <button
                      className="px-6 py-2 bg-green-600 text-white text-lg font-bold rounded shadow hover:bg-green-700 transition"
                      onClick={() => hitOrStayPlayer(Action.Hit)}
                    >
                        Hit
                    </button>
                    <button
                      className="px-6 py-2 bg-red-600 text-white text-lg font-bold rounded shadow hover:bg-red-700 transition"
                      onClick={() => hitOrStayPlayer(Action.Stay)}
                    >
                        Stay
                    </button>
                </>
              )}

              {gameState === GameState.GameConcluded && (
                <button
                  className="px-6 py-2 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 transition"
                  onClick={startNewRound}
                >
                    New Round
                </button>
              )}
          </div>
      </div>
    );
}

export default Card;