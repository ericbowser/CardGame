// components/GameBoard.jsx - This replaces your existing Deck.jsx component
import React, { useEffect, useCallback } from 'react';
import { useGameContext } from '../GameContext';
import { GameState, Who, Action } from '../../helpers/Utils';
import BettingSystem from './BettingSystem';
import {CardDisplay} from './CardDisplay';
import GameRules from './GameRules';
import BasicStrategyHelper from '../../helpers/BasicStrategyHelper';

/**
 * GameBoard is the "conductor" of our blackjack orchestra.
 *
 * This component demonstrates the "Container/Presenter" pattern:
 * - It contains all the business logic (the "smart" part)
 * - It delegates presentation to specialized components (the "dumb" parts)
 *
 * Notice how this component doesn't directly render cards or betting interfaces.
 * Instead, it manages the game flow and passes data to components that specialize
 * in those specific responsibilities. This separation makes each component
 * easier to test, debug, and modify independently.
 */
const GameBoard = () => {
  // Extract everything we need from our centralized context
  // This replaces all the scattered useState calls from your original components
  const {
    // Game state management
    gameState,
    setGameState,
    alertMessage,
    setAlertMessage,
    logs,
    addLog,

    // Deck and card information
    isDeckShuffled,
    shuffleDeck,
    playerCards,
    dealerCards,
    showDealerHoleCard,
    setShowDealerHoleCard,

    // Game calculations (automatically updated by the context)
    playerCount,
    dealerCount,
    playerBlackjack,
    dealerBlackjack,
    playerBust,
    dealerBust,
    isSoftHand,

    // Player information
    playerChips,
    currentBet,
    canBet,

    // Game actions
    dealInitialCards,
    playerHit,
    dealerHit,

    // Game results
    winner,
    setWinner,
    setRoundOver,

    // Game management functions
    handleWin,
    handleLoss,
    handlePush,
    startNewRound,
    resetGame
  } = useGameContext();

  /**
   * GAME LOGIC ENGINE
   *
   * This section contains the core blackjack rules implementation.
   * Each function handles a specific game scenario with proper error handling.
   * This logic was scattered across multiple components in your original code.
   */

  /**
   * Check for blackjacks after initial cards are dealt
   *
   * This implements the standard casino rule where blackjacks are checked
   * immediately after the initial deal, before any player actions.
   */
  const checkInitialBlackjacks = useCallback(() => {
    if (playerCards.length !== 2 || dealerCards.length !== 2) return;

    addLog('Checking for blackjacks...');

    // Handle all possible blackjack scenarios
    if (playerBlackjack && dealerBlackjack) {
      // Both have blackjack - it's a push (tie)
      setShowDealerHoleCard(true);
      setWinner("Push");
      setAlertMessage("Push! Both have Blackjack!");
      addLog("Push - both player and dealer have blackjack");
      handlePush();
      setGameState(GameState.GameConcluded);
      setRoundOver(true);
      return;
    }

    if (playerBlackjack && !dealerBlackjack) {
      // Player wins with blackjack - pays 3:2
      setShowDealerHoleCard(true);
      setWinner(Who.Player);
      setAlertMessage("Blackjack! You win!");
      addLog("Player wins with blackjack!");
      handleWin(true); // true indicates blackjack win (3:2 payout)
      setGameState(GameState.GameConcluded);
      setRoundOver(true);
      return;
    }

    if (dealerBlackjack && !playerBlackjack) {
      // Dealer wins with blackjack
      setShowDealerHoleCard(true);
      setWinner(Who.Dealer);
      setAlertMessage("Dealer Blackjack! You lose.");
      addLog("Dealer wins with blackjack");
      handleLoss();
      setGameState(GameState.GameConcluded);
      setRoundOver(true);
      return;
    }

    // No blackjacks - proceed to normal play
    addLog("No blackjacks - player's turn");
    setGameState(GameState.PlayerPhase);
  }, [
    playerCards.length,
    dealerCards.length,
    playerBlackjack,
    dealerBlackjack,
    setShowDealerHoleCard,
    setWinner,
    setAlertMessage,
    addLog,
    handleWin,
    handleLoss,
    handlePush,
    setGameState,
    setRoundOver
  ]);

  /**
   * Handle player bust scenario
   *
   * When a player goes over 21, the hand immediately ends.
   * This is a fundamental blackjack rule that your original code handled
   * in a scattered way across multiple useEffect hooks.
   */
  const handlePlayerBust = useCallback(() => {
    addLog(`Player busts with ${playerCount}`);
    setWinner(Who.Dealer);
    setAlertMessage("You busted! Dealer wins.");
    handleLoss();
    setGameState(GameState.GameConcluded);
    setRoundOver(true);
  }, [playerCount, addLog, setWinner, setAlertMessage, handleLoss, setGameState, setRoundOver]);

  /**
   * Handle the dealer's automated play according to house rules
   *
   * This implements the standard casino rule: dealer must hit on 16 or less,
   * must stand on 17 or more. The automation makes the game feel more like
   * playing against a real dealer.
   */
  const playDealerTurn = useCallback(() => {
    setShowDealerHoleCard(true);
    addLog(`Dealer reveals hole card - total: ${dealerCount}`);

    // Recursive function to handle dealer's sequential hits
    const continueDealer = () => {
      if (dealerCount < 17) {
        addLog("Dealer must hit");
        setTimeout(() => {
          if (dealerHit()) {
            // The dealerCount will be updated by the context automatically
            // which will trigger this effect again to continue the dealer's turn
          } else {
            addLog("Error: Could not deal card to dealer");
            compareHands();
          }
        }, 1500); // Delay makes the game feel more natural
      } else {
        addLog(`Dealer stands with ${dealerCount}`);
        compareHands();
      }
    };

    continueDealer();
  }, [dealerCount, dealerHit, addLog, setShowDealerHoleCard]);

  /**
   * Compare final hands when both player and dealer are done
   *
   * This implements the final resolution of the hand according to
   * standard blackjack rules. Notice how much cleaner this is when
   * all the state is centralized and we don't have to worry about
   * synchronization between components.
   */
  const compareHands = useCallback(() => {
    // Handle dealer bust first
    if (dealerBust) {
      addLog(`Dealer busts with ${dealerCount}`);
      setWinner(Who.Player);
      setAlertMessage("Dealer busts! You win!");
      handleWin();
      setGameState(GameState.GameConcluded);
      setRoundOver(true);
      return;
    }

    // Both hands are valid - compare values
    if (playerCount > dealerCount) {
      addLog(`Player wins: ${playerCount} vs ${dealerCount}`);
      setWinner(Who.Player);
      setAlertMessage(`You win with ${playerCount}!`);
      handleWin();
    } else if (dealerCount > playerCount) {
      addLog(`Dealer wins: ${dealerCount} vs ${playerCount}`);
      setWinner(Who.Dealer);
      setAlertMessage(`Dealer wins with ${dealerCount}`);
      handleLoss();
    } else {
      addLog(`Push: both have ${playerCount}`);
      setWinner("Push");
      setAlertMessage(`Push! Both have ${playerCount}`);
      handlePush();
    }

    setGameState(GameState.GameConcluded);
    setRoundOver(true);
  }, [
    dealerBust,
    dealerCount,
    playerCount,
    addLog,
    setWinner,
    setAlertMessage,
    handleWin,
    handleLoss,
    handlePush,
    setGameState,
    setRoundOver
  ]);

  /**
   * Handle player actions (Hit or Stand)
   *
   * This centralizes the player decision logic that was previously
   * scattered across your Card component. Notice how we validate
   * the game state before allowing actions.
   */
  const handlePlayerAction = useCallback((action) => {
    if (gameState !== GameState.PlayerPhase) {
      addLog("Cannot perform action at this time");
      return;
    }

    switch (action) {
      case Action.Hit:
        addLog("Player chooses to hit");
        if (!playerHit()) {
          addLog("Error: Could not deal card to player");
        }
        break;

      case Action.Stay:
        addLog("Player chooses to stay");
        setGameState(GameState.DealerPhase);
        break;

      default:
        addLog(`Unknown action: ${action}`);
    }
  }, [gameState, addLog, playerHit, setGameState]);

  /**
   * GAME FLOW EFFECTS
   *
   * These useEffect hooks manage the automatic progression of the game.
   * They replace the complex, scattered effect logic from your original components
   * with a clean, predictable flow that's easy to understand and debug.
   */

  // Effect: Start new hand when bet is placed
  useEffect(() => {
    if (gameState === GameState.CardsDealt && currentBet > 0) {
      addLog(`Starting new hand with $${currentBet} bet`);
      if (dealInitialCards()) {
        addLog("Cards dealt successfully");
      } else {
        addLog("Error dealing cards");
        setGameState(null);
      }
    }
  }, [gameState, currentBet, addLog, dealInitialCards, setGameState]);

  // Effect: Check for blackjacks after initial deal
  useEffect(() => {
    if (gameState === GameState.CardsDealt && playerCards.length === 2 && dealerCards.length === 2) {
      // Small delay lets the UI update with the cards before checking blackjacks
      setTimeout(checkInitialBlackjacks, 1000);
    }
  }, [gameState, playerCards.length, dealerCards.length, checkInitialBlackjacks]);

  // Effect: Handle player bust
  useEffect(() => {
    if (gameState === GameState.PlayerPhase && playerBust) {
      handlePlayerBust();
    }
  }, [gameState, playerBust, handlePlayerBust]);

  // Effect: Handle dealer's turn
  useEffect(() => {
    if (gameState === GameState.DealerPhase && !playerBust) {
      // Small delay before dealer plays creates better user experience
      setTimeout(playDealerTurn, 1000);
    }
  }, [gameState, playerBust, playDealerTurn]);

  // Effect: Handle dealer bust during dealer's turn
  useEffect(() => {
    if (gameState === GameState.DealerPhase && dealerBust) {
      compareHands();
    }
  }, [gameState, dealerBust, compareHands]);

  // Effect: Auto-clear alert messages
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage, setAlertMessage]);

  /**
   * RENDER THE GAME INTERFACE
   *
   * Notice how clean this render method is compared to your original Deck component.
   * Each section has a single responsibility, and we pass only the data each
   * component needs to do its job. This is the "props drilling" solution in action.
   */
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Sidebar - Game Controls and Information */}
        <div className="w-full lg:w-1/3 space-y-6">

          {/* Game Controls */}
          <div className="bg-blue-900/30 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
            <div className="space-y-3">
              <button
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={shuffleDeck}
                disabled={isDeckShuffled}
              >
                {isDeckShuffled ? 'Deck Ready' : 'Shuffle Deck'}
              </button>

              <button
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-all duration-200"
                onClick={resetGame}
              >
                Reset Game
              </button>
            </div>
          </div>

          {/* Betting System - Only show when appropriate */}
          {isDeckShuffled && !gameState && canBet && (
            <BettingSystem />
          )}

          {/* Basic Strategy Helper - Show during player's turn */}
          {gameState === GameState.PlayerPhase && playerCards.length >= 2 && dealerCards.length >= 1 && (
            <BasicStrategyHelper
              playerCards={playerCards}
              dealerUpCard={dealerCards[0]} // First dealer card (up card)
              playerTotal={playerCount}
              isPlayerTurn={true}
              isSoft={isSoftHand(playerCards, playerCount)}
            />
          )}

          {/* Game Rules */}
          <GameRules />

          {/* Game Log */}
          <div className="bg-gray-900/50 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-white mb-3">Game Log</h2>
            <div className="bg-black/30 p-3 rounded h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-400 text-center italic">
                  Game log will appear here...
                </div>
              ) : (
                logs.map((entry, index) => (
                  <div
                    key={index}
                    className="text-white text-sm mb-2 border-b border-gray-800/50 pb-2 last:border-b-0"
                  >
                    <span className="text-gray-400 text-xs mr-2">
                      {new Date().toLocaleTimeString()}
                    </span>
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="w-full lg:w-2/3">

          {/* Alert Message */}
          {alertMessage && (
            <div className="bg-yellow-500 bg-opacity-90 text-white text-center p-4 rounded-lg shadow-lg mb-6 text-xl font-bold animate-pulse">
              {alertMessage}
            </div>
          )}

          {/* Game Status Display */}
          <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-lg font-semibold">Chips: ${playerChips}</span>
                {currentBet > 0 && (
                  <span className="ml-4 text-lg font-semibold text-yellow-300">
                    Bet: ${currentBet}
                  </span>
                )}
              </div>

              {winner && gameState === GameState.GameConcluded && (
                <div className="text-center">
                  <span className={`text-2xl font-bold ${
                    winner === Who.Player ? 'text-green-400' :
                      winner === Who.Dealer ? 'text-red-400' :
                        'text-yellow-400'
                  }`}>
                    {winner === "Push" ? "Push!" : `${winner} Wins!`}
                  </span>
                </div>
              )}

              <div>
                <span className="text-lg font-semibold">
                  Dealer: {showDealerHoleCard ? dealerCount : '?'}
                </span>
                <span className="mx-4 text-lg font-semibold">
                  Player: {playerCount}
                </span>
              </div>
            </div>
          </div>

          {/* Card Display - This replaces your original Card component */}
          {isDeckShuffled ? (
            <CardDisplay
              playerCards={playerCards}
              dealerCards={dealerCards}
              showDealerHoleCard={showDealerHoleCard}
              gameState={gameState}
              onPlayerAction={handlePlayerAction}
              onNewRound={startNewRound}
            />
          ) : (
            <div className="flex justify-center items-center h-96 bg-green-800 bg-opacity-30 rounded-lg shadow-lg">
              <div className="text-center">
                <p className="text-white text-2xl mb-4">Shuffling deck...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;