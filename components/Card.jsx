import React, { useEffect, useState } from "react";
import { Who, Action, GameState } from '../src/Utils';

function Card({ shuffledDeck = [], addLog, setAlertMessage, setGameState, gameState }) {
    // Card state
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [cardsSet, setCardsSet] = useState(false);
    const [holeCard, setHoleCard] = useState(null);

    // Game state
    const [playerBlackJack, setPlayerBlackJack] = useState(false);
    const [dealerBlackJack, setDealerBlackJack] = useState(false);
    const [playerBust, setPlayerBust] = useState(false);
    const [dealerBust, setDealerBust] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);
    const [dealerCount, setDealerCount] = useState(0);
    const [winner, setWinner] = useState(null);
    const [push, setPush] = useState(false);
    const [showHoleCard, setShowHoleCard] = useState(false);
    const [roundOver, setRoundOver] = useState(false);

    // Betting state (we'll add this in the next iteration)
    const [playerBet, setPlayerBet] = useState(0);
    const [playerChips, setPlayerChips] = useState(1000);

    // Determine outcome when player or dealer busts
    useEffect(() => {
        if (playerBust && !dealerBust) {
            setWinner(Who.Dealer);
            addLog("Player busts! Dealer wins.");
            setGameState(GameState.GameConcluded);
            setRoundOver(true);
        }
        if (!playerBust && dealerBust) {
            setWinner(Who.Player);
            addLog("Dealer busts! Player wins.");
            setGameState(GameState.GameConcluded);
            setRoundOver(true);
        }
    }, [dealerBust, playerBust, addLog, setGameState]);

    // Handle BlackJack scenarios
    useEffect(() => {
        if (dealerBlackJack && playerBlackJack) {
            setPush(true);
            setWinner("Push");
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
    }, [dealerBlackJack, playerBlackJack, addLog, setAlertMessage, setGameState]);

    // Compare scores at the end of the round
    useEffect(() => {
        if (gameState === GameState.GameConcluded && !roundOver && !playerBust && !dealerBust && !playerBlackJack && !dealerBlackJack) {
            setShowHoleCard(true);

            if (playerCount > dealerCount) {
                setWinner(Who.Player);
                setAlertMessage(`Player wins with ${playerCount}!`);
                addLog(`Player wins with ${playerCount} against dealer's ${dealerCount}.`);
            } else if (dealerCount > playerCount) {
                setWinner(Who.Dealer);
                setAlertMessage(`Dealer wins with ${dealerCount}!`);
                addLog(`Dealer wins with ${dealerCount} against player's ${playerCount}.`);
            } else {
                setPush(true);
                setWinner("Push");
                setAlertMessage(`Push! Both have ${playerCount}.`);
                addLog(`Push! Both have ${playerCount}.`);
            }
            setRoundOver(true);
        }
    }, [gameState, roundOver, playerBust, dealerBust, playerBlackJack, dealerBlackJack, playerCount, dealerCount, addLog, setAlertMessage]);

    // Deal initial cards
    useEffect(() => {
        if (playerCards.length === 0 && dealerCards.length === 0) {
            setCards();
        }

        // Check for initial BlackJack
        if (playerCards.length === 2 && dealerCards.length === 2 && cardsSet) {
            addLog('Dealing Cards...');
            addLog('Checking for BlackJack...');

            // Calculate initial hands
            setPlayerHand();
            setDealerHand();

            // Check for blackjack
            checkForBlackJack(playerCards, Who.Player);
            checkForBlackJack(dealerCards, Who.Dealer);

            // If no blackjack, continue to player phase
            if (!playerBlackJack && !dealerBlackJack) {
                setGameState(GameState.PlayerPhase);
            }
        }
    }, [playerCards, dealerCards, cardsSet]);

    // Show hole card when dealer's turn begins or game concludes
    useEffect(() => {
        if (gameState === GameState.DealerPhase || gameState === GameState.GameConcluded) {
            setShowHoleCard(true);
        }
    }, [gameState]);

    // Auto-play dealer's turn according to house rules
    useEffect(() => {
        if (gameState === GameState.DealerPhase && !dealerBlackJack && !playerBlackJack && !playerBust) {
            // Dealer must hit on 16 or less, stand on 17 or more
            if (dealerCount < 17) {
                // Use setTimeout to create a slight delay for better UX
                const timer = setTimeout(() => {
                    hitOrStayDealer(Action.Hit);
                }, 1000);

                return () => clearTimeout(timer);
            } else {
                addLog(`Dealer stands with ${dealerCount}.`);
                setGameState(GameState.GameConcluded);
            }
        }
    }, [gameState, dealerCount, dealerBlackJack, playerBlackJack, playerBust]);

    // Setup initial cards
    const setCards = () => {
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

            setPlayerCards(player);
            setDealerCards(dealer);
            setHoleCard(dealerCard2);
            setCardsSet(true);

            addLog(`Player receives ${getCardName(playerCard1)} and ${getCardName(playerCard2)}`);
            addLog(`Dealer shows ${getCardName(dealerCard1)} and has one face-down card`);
        }
    };

    // Get readable card name from path
    const getCardName = (cardPath) => {
        if (!cardPath) return 'unknown';

        const fileName = cardPath.split('/').pop();
        return fileName.replace('.png', '').replace('.jpg', '').replace('_', ' ');
    };

    // Calculate dealer's hand value
    function setDealerHand() {
        let total = 0;
        let aces = 0;

        dealerCards.forEach(card => {
            const cardName = getCardName(card);

            if (cardName.includes('ace')) {
                aces++;
            } else if (cardName.includes('king') || cardName.includes('queen') || cardName.includes('jack') || cardName.includes('10')) {
                total += 10;
            } else {
                // Extract number from card name
                const match = cardName.match(/^(\d+)/);
                if (match) {
                    total += parseInt(match[0]);
                }
            }
        });

        // Add aces (1 or 11 each)
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
            setAlertMessage("Dealer Busts!");
        }
    }

    // Calculate player's hand value
    function setPlayerHand() {
        let total = 0;
        let aces = 0;

        playerCards.forEach(card => {
            const cardName = getCardName(card);

            if (cardName.includes('ace')) {
                aces++;
            } else if (cardName.includes('king') || cardName.includes('queen') || cardName.includes('jack') || cardName.includes('10')) {
                total += 10;
            } else {
                // Extract number from card name
                const match = cardName.match(/^(\d+)/);
                if (match) {
                    total += parseInt(match[0]);
                }
            }
        });

        // Add aces (1 or 11 each)
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
            setAlertMessage("Player Busts!");
        }
    }

    // Dealer actions (hit or stay)
    const hitOrStayDealer = (choice = '') => {
        if (choice === Action.Hit) {
            addLog("Dealer hits");
            const card = shuffledDeck.pop();
            const newDealerCards = [...dealerCards, card];
            setDealerCards(newDealerCards);
            addLog(`Dealer draws ${getCardName(card)}`);

            // Recalculate dealer's hand after new card
            setTimeout(() => {
                setDealerHand();
            }, 200);
        } else if (choice === Action.Stay) {
            addLog("Dealer stays");
            setGameState(GameState.GameConcluded);
        }
    };

    // Player actions (hit or stay)
    const hitOrStayPlayer = (choice = '') => {
        if (choice === Action.Hit) {
            addLog("Player hits");
            const card = shuffledDeck.pop();
            const newPlayerCards = [...playerCards, card];
            setPlayerCards(newPlayerCards);
            addLog(`Player draws ${getCardName(card)}`);

            // Recalculate player's hand after new card
            setTimeout(() => {
                setPlayerHand();
            }, 200);
        } else if (choice === Action.Stay) {
            addLog("Player stays");
            setGameState(GameState.DealerPhase);
        }
    };

    // Check for blackjack (Ace + 10-value card)
    function checkForBlackJack(cards = [], who = '') {
        if (cards.length !== 2) return false;

        // Check if one card is an ace
        const hasAce = cards.some(card => getCardName(card).includes('ace'));

        // Check if one card is a 10-value card (10, J, Q, K)
        const hasTenValue = cards.some(card => {
            const name = getCardName(card);
            return name.includes('10') ||
              name.includes('jack') ||
              name.includes('queen') ||
              name.includes('king');
        });

        // If both conditions are true, it's a blackjack
        if (hasAce && hasTenValue) {
            if (who === Who.Dealer) {
                setDealerBlackJack(true);
            } else if (who === Who.Player) {
                setPlayerBlackJack(true);
            }
            return true;
        }

        return false;
    }

    // Render player cards
    const getPlayerCards = () => {
        return playerCards.map((card, index) => {
            // Basic layout for now - can be enhanced with better positioning
            const offset = index * 30;
            return (
              <div
                key={`player-card-${index}`}
                className="relative inline-block m-1"
                style={{ marginLeft: index > 0 ? `-80px` : '0' }}
              >
                  <img
                    src={card}
                    alt={`Player card ${index + 1}`}
                    className="w-32 h-48 rounded-lg shadow-lg"
                  />
              </div>
            );
        });
    };

    // Render dealer cards 
    const getDealerCards = () => {
        return dealerCards.map((card, index) => {
            // For the second card (hole card), show face down unless showHoleCard is true
            const isHoleCard = index === 1;
            const offset = index * 30;

            return (
              <div
                key={`dealer-card-${index}`}
                className="relative inline-block m-1"
                style={{ marginLeft: index > 0 ? `-80px` : '0' }}
              >
                  <img
                    src={isHoleCard && !showHoleCard ? '/src/assets/facedown4.jpg' : card}
                    alt={`Dealer card ${index + 1}`}
                    className="w-32 h-48 rounded-lg shadow-lg"
                  />
              </div>
            );
        });
    };

    return (
      <div className="w-full max-w-4xl mx-auto">
          {/* Game info section */}
          <div className="mb-6 flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-bold">Player: ${playerChips}</h2>
                  <p>Current bet: ${playerBet}</p>
              </div>

              {winner && (
                <div className={`text-center text-xl font-bold p-2 rounded-lg ${
                  winner === Who.Player ? 'bg-green-600 text-white' :
                    winner === Who.Dealer ? 'bg-red-600 text-white' :
                      'bg-yellow-400 text-black'
                }`}>
                    {winner === "Push" ? "Push!" : `${winner} Wins!`}
                </div>
              )}

              <div className="text-right">
                  <p className="text-lg font-semibold">Dealer: {showHoleCard ? dealerCount : '?'}</p>
                  <p className="text-lg font-semibold">Player: {playerCount}</p>
              </div>
          </div>

          {/* Dealer's cards */}
          <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Dealer's Hand</h2>
              <div className="flex ml-16">{getDealerCards()}</div>
          </div>

          {/* Player's cards */}
          <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Player's Hand</h2>
              <div className="flex ml-16">{getPlayerCards()}</div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center mt-6 gap-4">
              {gameState === GameState.PlayerPhase && (
                <>
                    <button
                      className="px-6 py-2 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 transition"
                      onClick={() => hitOrStayPlayer(Action.Hit)}
                    >
                        Hit
                    </button>
                    <button
                      className="px-6 py-2 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 transition"
                      onClick={() => hitOrStayPlayer(Action.Stay)}
                    >
                        Stay
                    </button>
                </>
              )}

              {gameState === GameState.GameConcluded && (
                <button
                  className="px-6 py-2 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition"
                  onClick={() => {
                      // Code for starting a new round
                      // This will be implemented later
                  }}
                >
                    New Round
                </button>
              )}
          </div>
      </div>
    );
}

export default Card;