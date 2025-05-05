import React, { useEffect, useState } from 'react';
import Card from "./Card";
import BettingSystem from "./BettingSystem";
import GameRules from "./GameRules";
import useGameLog from "./GameLog";
import { GameState } from "../src/Utils";

const Deck = () => {
    // Game state
    const [gameState, setGameState] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const [winner, setWinner] = useState(null);

    // Deck state
    const [deck, setDeck] = useState([]);
    const [shuffledDeck, setShuffledDeck] = useState([]);
    const [isDeckShuffled, setIsDeckShuffled] = useState(false);

    // Player state
    const [playerChips, setPlayerChips] = useState(1000);
    const [currentBet, setCurrentBet] = useState(0);

    // Game logging
    const { logs, addLog, clearLogs } = useGameLog([]);

    // Clear alert after a delay
    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    // Log game state changes
    useEffect(() => {
        if (gameState) {
            addLog(gameState);
        }
    }, [gameState]);

    // Import card images
    useEffect(() => {
        if (deck?.length === 0) {
            getImages().then(() => addLog('Cards loaded'));
        }
    }, [deck]);

    // Shuffle deck when loaded
    useEffect(() => {
        if (isDeckShuffled) {
            addLog('Deck Shuffled');
        }
        if (!isDeckShuffled && deck?.length > 0) {
            shuffleDeck();
        }
    }, [isDeckShuffled, deck]);

    // Import card images
    const importAllImages = async () => {
        const modulePaths = import.meta.glob('../src/assets/images/*.{png,jpg,jpeg,js}');
        const imagePromises = Object.keys(modulePaths).map((path) => modulePaths[path]());
        return await Promise.all(imagePromises);
    };

    const getImages = async () => {
        try {
            const images = await importAllImages();
            setDeck(images);
            return images;
        } catch (error) {
            console.error('Error loading images:', error);
            addLog('Error loading card images');
        }
    };

    // Shuffle the deck
    const shuffleDeck = () => {
        if (!deck || deck.length === 0) {
            console.log('No deck to shuffle');
            return;
        }

        // Create a copy of the deck to shuffle
        const deckCopy = [...deck];
        const shuffled = [];

        console.log('Original deck length:', deckCopy.length);

        // Fisher-Yates shuffle
        for (let i = deckCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
        }

        // Extract the image paths from the shuffled deck
        for (let i = 0; i < deckCopy.length; i++) {
            if (deckCopy[i]?.default) {
                shuffled.push(deckCopy[i].default);
            }
        }

        console.log('Shuffled deck length:', shuffled.length);

        // Only set the shuffled deck if we have all 52 cards
        if (shuffled.length === 52) {
            setShuffledDeck(shuffled);
            setIsDeckShuffled(true);
            addLog('Deck shuffled');
        } else {
            console.error(`Error: Incomplete deck after shuffling. Expected 52 cards, got ${shuffled.length}`);

            // Log the missing cards (optional)
            if (shuffled.length < 52) {
                console.log('Deck is missing cards');
            }

            // You might want to retry or handle this error differently
            addLog('Error shuffling deck - incomplete deck');
        }
    }

    // Handle winner updates
    useEffect(() => {
        if (winner) {
            if (winner === "Push") {
                setAlertMessage("It's a push!");
            } else {
                setAlertMessage(`${winner} wins!`);
            }
        }
    }, [winner]);

    // Reset game state
    const clearBoardState = () => {
        // Reset game state
        setGameState(null);
        setAlertMessage(null);
        setWinner(null);

        // Clear cards
        setDeck([]);
        setShuffledDeck([]);
        setIsDeckShuffled(false);

        // Reset player state
        setPlayerChips(1000);
        setCurrentBet(0);

        // Clear logs
        clearLogs();
        addLog('Game reset');
    };

    return (
      <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
              {/* Game controls and logs sidebar */}
              <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-6">
                  <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg shadow-lg mb-6">
                      <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
                      <div className="flex flex-col space-y-3">
                          <button
                            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                            onClick={shuffleDeck}
                            disabled={isDeckShuffled}
                          >
                              Shuffle Deck
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                            onClick={clearBoardState}
                          >
                              Reset Game
                          </button>
                          <div className="mt-2">
                              <GameRules />
                          </div>
                      </div>
                  </div>

                  {/* Betting system */}
                  {isDeckShuffled && gameState !== GameState.GameConcluded && gameState !== GameState.CardsDealt && gameState !== GameState.PlayerPhase && gameState !== GameState.DealerPhase && (
                    <BettingSystem
                      playerChips={playerChips}
                      setPlayerChips={setPlayerChips}
                      currentBet={currentBet}
                      setCurrentBet={setCurrentBet}
                      gameState={gameState}
                      setGameState={setGameState}
                      addLog={addLog}
                      winner={winner}
                    />
                  )}

                  {/* Game log */}
                  <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg shadow-lg mt-6">
                      <h2 className="text-xl font-bold text-white mb-2">Game Log</h2>
                      <div className="bg-black bg-opacity-30 p-3 rounded h-80 overflow-y-auto">
                          {logs.map((entry, index) => (
                            <div key={index} className="text-white text-sm mb-1 border-b border-gray-800 pb-1">
                                {entry}
                            </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Main game area */}
              <div className="w-full md:w-3/4">
                  {/* Alert message */}
                  {alertMessage && (
                    <div className="bg-yellow-500 bg-opacity-90 text-white text-center p-3 rounded-lg shadow-lg mb-6 text-xl font-bold">
                        {alertMessage}
                    </div>
                  )}

                  {/* Card component */}
                  {isDeckShuffled ? (
                    <Card
                      shuffledDeck={shuffledDeck}
                      addLog={addLog}
                      setAlertMessage={setAlertMessage}
                      setGameState={setGameState}
                      gameState={gameState}
                      setWinner={setWinner}
                      playerChips={playerChips}
                      setPlayerChips={setPlayerChips}
                      currentBet={currentBet}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-96 bg-green-800 bg-opacity-30 rounded-lg shadow-lg">
                        <p className="text-white text-2xl">Shuffle the deck to start playing</p>
                    </div>
                  )}
              </div>
          </div>
      </div>
    );
};

export default Deck;