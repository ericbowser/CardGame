// components/CardDisplay.jsx - NEW FILE
// This component replaces the card rendering logic from your original Card.jsx
import React from 'react';
import facedown from '../assets/facedown4.jpg';
import { GameState, Action } from '../../helpers/Utils';

/**
 * CardDisplay is a "pure presentational component"
 *
 * This means it only handles rendering and user interactions. It doesn't know
 * anything about game state, betting, or business logic. This separation makes
 * it incredibly easy to test, debug, and reuse.
 *
 * Notice how all the data comes in through props, and all communication back
 * to the parent happens through callback functions. This is called "lifting state up"
 * and it's one of the most important patterns in React.
 */
const CardDisplay = ({
                       playerCards,
                       dealerCards,
                       showDealerHoleCard,
                       gameState,
                       onPlayerAction,
                       onNewRound
                     }) => {

  /**
   * Render a single card with proper styling and animation
   *
   * This function demonstrates how to create reusable rendering logic.
   * Instead of duplicating card rendering code for players and dealers,
   * we create one function that handles both cases based on parameters.
   */
  const renderCard = (card, index, isHoleCard = false, isPlayer = true) => {
    const shouldShowCard = !isHoleCard || showDealerHoleCard;

    return (
      <div
        key={`${isPlayer ? 'player' : 'dealer'}-card-${index}`}
        className="inline-block relative transition-all duration-500 ease-in-out transform hover:scale-105"
        style={{
          marginLeft: index > 0 ? '-60px' : '0',
          zIndex: index,
          // CSS-in-JS animation that triggers when cards are dealt
          animation: `cardDeal 0.5s ease-out ${index * 0.2}s both`
        }}
      >
        <img
          src={shouldShowCard ? card : facedown}
          alt={`${isPlayer ? 'Player' : 'Dealer'} card ${index + 1}`}
          className="w-32 h-auto rounded-lg shadow-xl border-2 border-white/20"
          style={{
            // Flip animation when revealing the hole card
            transform: isHoleCard && showDealerHoleCard ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.8s ease-in-out'
          }}
        />
      </div>
    );
  };

  /**
   * Render all player cards with error handling
   *
   * Notice how we handle the edge case where cards might not be loaded yet.
   * This defensive programming prevents the dreaded "white screen of death"
   * that happens when components try to render undefined data.
   */
  const renderPlayerCards = () => {
    if (!playerCards || playerCards.length === 0) {
      return (
        <div className="text-white text-lg opacity-60">
          No cards dealt
        </div>
      );
    }

    return playerCards.map((card, index) =>
      renderCard(card, index, false, true)
    );
  };

  /**
   * Render dealer cards with hole card logic
   *
   * The hole card logic is a fundamental part of blackjack. The dealer's
   * second card is dealt face-down and only revealed when it's the dealer's turn.
   * This creates suspense and mirrors the real casino experience.
   */
  const renderDealerCards = () => {
    if (!dealerCards || dealerCards.length === 0) {
      return (
        <div className="text-white text-lg opacity-60">
          No cards dealt
        </div>
      );
    }

    return dealerCards.map((card, index) => {
      const isHoleCard = index === 1; // Second card is always the hole card
      return renderCard(card, index, isHoleCard, false);
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">

      {/* Dealer's Hand Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Dealer's Hand
        </h2>
        <div className="flex justify-center items-center min-h-48 bg-green-800/20 rounded-xl p-6">
          {renderDealerCards()}
        </div>
      </div>

      {/* Player's Hand Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Your Hand
        </h2>
        <div className="flex justify-center items-center min-h-48 bg-blue-800/20 rounded-xl p-6">
          {renderPlayerCards()}
        </div>
      </div>

      {/* Action Buttons - Conditional rendering based on game state */}
      <div className="flex justify-center space-x-6 mt-8">
        {gameState === GameState.PlayerPhase && (
          <>
            <button
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
              onClick={() => onPlayerAction(Action.Hit)}
            >
              HIT
            </button>
            <button
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
              onClick={() => onPlayerAction(Action.Stay)}
            >
              STAND
            </button>
          </>
        )}

        {gameState === GameState.GameConcluded && (
          <button
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
            onClick={onNewRound}
          >
            NEW HAND
          </button>
        )}
      </div>

      {/* Embedded CSS for card dealing animation */}
      <style jsx>{`
          @keyframes cardDeal {
              from {
                  opacity: 0;
                  transform: translateY(-50px) rotateX(-90deg);
              }
              to {
                  opacity: 1;
                  transform: translateY(0) rotateX(0deg);
              }
          }
      `}</style>
    </div>
  );
};

/**
 * Enhanced BettingSystem that demonstrates clean context integration
 *
 * Compare this to your original BettingSystem component. Notice how much
 * simpler the logic is when we don't have to manage scattered state.
 * The context handles all the complex game state synchronization for us.
 *
 * This component now has a single responsibility: handle betting interactions.
 * It doesn't need to know about cards, game phases, or win/loss calculations.
 */
const BettingSystem = () => {
  const {
    playerChips,
    currentBet,
    canBet,
    gameState,
    setGameState,
    placeBet,
    addLog
  } = useGameContext();

  // Local state for the betting interface
  // Notice how this is ONLY UI state, not game state
  const [betAmount, setBetAmount] = useState(25);

  // Standard casino chip denominations
  const chipValues = [5, 25, 50, 100];

  /**
   * Handle placing a bet with comprehensive validation
   *
   * This function demonstrates the "fail fast" principle. We check for
   * all possible error conditions first, then proceed with the happy path.
   * This makes the code easier to read and debug.
   */
  const handlePlaceBet = () => {
    if (betAmount <= 0) {
      addLog("Please select a bet amount");
      return;
    }

    if (betAmount > playerChips) {
      addLog("Insufficient chips for this bet");
      return;
    }

    // Use the context's placeBet function which handles all the business logic
    if (placeBet(betAmount)) {
      setGameState(GameState.CardsDealt);
    }
  };

  /**
   * Handle bet input changes with validation
   *
   * Notice how we clamp the value between 0 and playerChips. This prevents
   * users from entering invalid values and provides immediate feedback.
   */
  const handleBetChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setBetAmount(Math.min(Math.max(value, 0), playerChips));
  };

  /**
   * Casino-style chip clicking interaction
   *
   * This mimics the experience of clicking physical chips in a real casino,
   * making the interface more intuitive and enjoyable.
   */
  const handleChipClick = (value) => {
    setBetAmount(prev => Math.min(prev + value, playerChips));
  };

  // Quick bet helpers for common actions
  const maxBet = () => setBetAmount(playerChips);
  const clearBet = () => setBetAmount(0);

  return (
    <div className="bg-green-900/70 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 text-center">Place Your Bet</h2>

      {/* Casino-style chip selector with color coding */}
      <div className="flex justify-center space-x-2 mb-4">
        {chipValues.map(value => (
          <button
            key={`chip-${value}`}
            className={`w-14 h-14 rounded-full text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              value === 5 ? 'bg-red-500 hover:bg-red-600' :
                value === 25 ? 'bg-green-500 hover:bg-green-600' :
                  value === 50 ? 'bg-blue-500 hover:bg-blue-600' :
                    'bg-purple-500 hover:bg-purple-600'
            }`}
            onClick={() => handleChipClick(value)}
            disabled={!canBet || betAmount + value > playerChips}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Bet amount input with integrated controls */}
      <div className="flex mb-4 rounded-lg overflow-hidden">
        <input
          type="number"
          value={betAmount}
          onChange={handleBetChange}
          min="0"
          max={playerChips}
          className="flex-1 p-3 bg-white text-black text-center text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          disabled={!canBet}
          placeholder="Bet amount"
        />
        <button
          onClick={clearBet}
          className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors disabled:opacity-50"
          disabled={!canBet}
        >
          Clear
        </button>
        <button
          onClick={maxBet}
          className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition-colors disabled:opacity-50"
          disabled={!canBet}
        >
          Max
        </button>
      </div>

      {/* Clear information display */}
      <div className="flex justify-between items-center text-white mb-4">
        <span>Available: <span className="font-bold">${playerChips}</span></span>
        <span>Betting: <span className="font-bold text-yellow-300">${betAmount}</span></span>
      </div>

      {/* Primary action button with clear disabled states */}
      <button
        onClick={handlePlaceBet}
        className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
      >
        Deal Cards & Start Hand
      </button>
    </div>
  );
};

export { CardDisplay, BettingSystem };