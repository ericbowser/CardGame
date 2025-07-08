// helpers/BasicStrategyHelper.jsx (Enhanced Integration)
import React, { useState, useMemo } from 'react';

/**
 * Enhanced BasicStrategyHelper that not only provides optimal play recommendations
 * but also educates the player about WHY certain plays are optimal.
 * This demonstrates how to create components that are both functional and educational.
 */

// Complete basic strategy chart for single deck blackjack
const basicStrategy = {
  hard: {
    // Player total: [2,3,4,5,6,7,8,9,10,A] (dealer up card)
    5: ['H','H','H','H','H','H','H','H','H','H'],
    6: ['H','H','H','H','H','H','H','H','H','H'],
    7: ['H','H','H','H','H','H','H','H','H','H'],
    8: ['H','H','H','H','H','H','H','H','H','H'],
    9: ['H','D','D','D','D','H','H','H','H','H'],
    10: ['D','D','D','D','D','D','D','D','H','H'],
    11: ['D','D','D','D','D','D','D','D','D','D'],
    12: ['H','H','S','S','S','H','H','H','H','H'],
    13: ['S','S','S','S','S','H','H','H','H','H'],
    14: ['S','S','S','S','S','H','H','H','H','H'],
    15: ['S','S','S','S','S','H','H','H','H','H'],
    16: ['S','S','S','S','S','H','H','H','H','H'],
    17: ['S','S','S','S','S','S','S','S','S','S'],
    18: ['S','S','S','S','S','S','S','S','S','S'],
    19: ['S','S','S','S','S','S','S','S','S','S'],
    20: ['S','S','S','S','S','S','S','S','S','S'],
    21: ['S','S','S','S','S','S','S','S','S','S']
  },
  soft: {
    // A,2 through A,9 (soft hands)
    13: ['H','H','H','D','D','H','H','H','H','H'], // A,2
    14: ['H','H','H','D','D','H','H','H','H','H'], // A,3
    15: ['H','H','D','D','D','H','H','H','H','H'], // A,4
    16: ['H','H','D','D','D','H','H','H','H','H'], // A,5
    17: ['H','D','D','D','D','H','H','H','H','H'], // A,6
    18: ['S','D','D','D','D','S','S','H','H','H'], // A,7
    19: ['S','S','S','S','S','S','S','S','S','S'], // A,8
    20: ['S','S','S','S','S','S','S','S','S','S'], // A,9
    21: ['S','S','S','S','S','S','S','S','S','S']  // A,10 (blackjack)
  }
};

// Educational explanations for different scenarios
const strategyExplanations = {
  'H': {
    action: 'Hit',
    reasoning: 'Taking another card gives you the best mathematical chance of improving your hand without busting.'
  },
  'S': {
    action: 'Stand',
    reasoning: 'Your hand is strong enough that the risk of busting outweighs the potential benefit of hitting.'
  },
  'D': {
    action: 'Double Down',
    reasoning: 'This situation favors you so strongly that doubling your bet and taking exactly one more card maximizes your expected value.'
  }
};

/**
 * Helper functions to analyze the game situation
 */

// Convert dealer card filename to strategy chart index
const getDealerIndex = (dealerCard) => {
  if (!dealerCard || typeof dealerCard !== 'string') return 0;

  if (dealerCard.includes('ace')) return 9;
  if (dealerCard.includes('king') || dealerCard.includes('queen') ||
    dealerCard.includes('jack') || dealerCard.includes('10')) return 8;

  const match = dealerCard.match(/(\d+)_of/);
  if (match && match[1]) {
    const value = parseInt(match[1]);
    return Math.max(0, Math.min(7, value - 2)); // Clamp between 0-7
  }
  return 0;
};

// Extract dealer card display name
const getDealerDisplayName = (dealerCard) => {
  if (!dealerCard) return 'Unknown';

  if (dealerCard.includes('ace')) return 'Ace';
  if (dealerCard.includes('king')) return 'King';
  if (dealerCard.includes('queen')) return 'Queen';
  if (dealerCard.includes('jack')) return 'Jack';
  if (dealerCard.includes('10')) return '10';

  const match = dealerCard.match(/(\d+)_of/);
  return match ? match[1] : 'Unknown';
};

// Determine hand composition for educational purposes
const analyzeHand = (cards, total) => {
  if (!cards || cards.length === 0) return { type: 'empty', description: 'No cards' };

  const hasAce = cards.some(card => card.includes('ace'));
  const isSoft = hasAce && total <= 21 && total >= 12;

  return {
    type: isSoft ? 'soft' : 'hard',
    description: isSoft ? `Soft ${total}` : `Hard ${total}`,
    hasAce,
    cardCount: cards.length
  };
};

const BasicStrategyHelper = ({
                               playerCards,
                               dealerUpCard,
                               playerTotal,
                               isPlayerTurn,
                               isSoft
                             }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFullChart, setShowFullChart] = useState(false);

  // Calculate optimal strategy using memoization for performance
  const strategy = useMemo(() => {
    if (!isPlayerTurn || !playerCards?.length || !dealerUpCard || playerTotal > 21) {
      return null;
    }

    const dealerIndex = getDealerIndex(dealerUpCard);
    const handAnalysis = analyzeHand(playerCards, playerTotal);

    let optimalPlay = 'S'; // Default to Stand

    // Look up the optimal play in our strategy charts
    if (handAnalysis.type === 'soft' && basicStrategy.soft[playerTotal]) {
      optimalPlay = basicStrategy.soft[playerTotal][dealerIndex];
    } else if (basicStrategy.hard[playerTotal]) {
      optimalPlay = basicStrategy.hard[playerTotal][dealerIndex];
    }

    return {
      play: optimalPlay,
      handAnalysis,
      dealerCard: getDealerDisplayName(dealerUpCard),
      explanation: strategyExplanations[optimalPlay]
    };
  }, [playerCards, dealerUpCard, playerTotal, isPlayerTurn, isSoft]);

  // Don't render if we don't have enough information
  if (!strategy) {
    return null;
  }

  return (
    <div className="bg-blue-800/80 backdrop-blur p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Strategy Assistant</h3>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-yellow-300 hover:text-yellow-200 text-sm underline"
        >
          {showExplanation ? 'Hide Details' : 'Why?'}
        </button>
      </div>

      {/* Current Situation Analysis */}
      <div className="bg-black/20 rounded p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-white text-sm">
          <div>
            <span className="text-gray-300">Your Hand:</span>
            <div className="font-bold">{strategy.handAnalysis.description}</div>
          </div>
          <div>
            <span className="text-gray-300">Dealer Shows:</span>
            <div className="font-bold">{strategy.dealerCard}</div>
          </div>
        </div>
      </div>

      {/* Strategy Recommendation */}
      <div className="text-center mb-4">
        <div className="text-yellow-300 text-sm mb-2">Optimal Play:</div>
        <div className={`text-2xl font-bold px-4 py-2 rounded ${
          strategy.play === 'H' ? 'bg-green-600 text-white' :
            strategy.play === 'S' ? 'bg-red-600 text-white' :
              'bg-purple-600 text-white'
        }`}>
          {strategy.explanation.action.toUpperCase()}
        </div>
      </div>

      {/* Detailed Explanation (expandable) */}
      {showExplanation && (
        <div className="bg-black/20 rounded p-4 mb-4 text-white text-sm">
          <div className="font-semibold mb-2">Why {strategy.explanation.action}?</div>
          <p className="mb-3">{strategy.explanation.reasoning}</p>

          {/* Additional educational content based on hand type */}
          {strategy.handAnalysis.type === 'soft' && (
            <div className="bg-blue-900/30 rounded p-3 mb-2">
              <div className="font-semibold text-blue-200">Soft Hand Strategy:</div>
              <p className="text-xs">
                Soft hands are more flexible because the Ace can be counted as 1 or 11.
                This allows for more aggressive play since you cannot bust on the next card.
              </p>
            </div>
          )}

          {strategy.play === 'D' && (
            <div className="bg-purple-900/30 rounded p-3 mb-2">
              <div className="font-semibold text-purple-200">Double Down Opportunity:</div>
              <p className="text-xs">
                The dealer is in a weak position, making this an ideal time to increase your bet.
                You'll receive exactly one more card and then must stand.
              </p>
            </div>
          )}

          {playerTotal >= 12 && playerTotal <= 16 && strategy.dealerCard >= '2' && strategy.dealerCard <= '6' && (
            <div className="bg-yellow-900/30 rounded p-3">
              <div className="font-semibold text-yellow-200">Dealer Bust Strategy:</div>
              <p className="text-xs">
                The dealer has a high chance of busting with their up card.
                Let them take the risk while you preserve your hand.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Chart Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowFullChart(!showFullChart)}
          className="text-blue-200 hover:text-blue-100 text-xs underline"
        >
          {showFullChart ? 'Hide' : 'Show'} Basic Strategy Chart
        </button>
      </div>

      {/* Mini Strategy Chart (expandable) */}
      {showFullChart && (
        <div className="mt-4 bg-black/30 rounded p-4 overflow-x-auto">
          <div className="text-white text-xs">
            <div className="font-semibold mb-2">Quick Reference (Hard Hands)</div>
            <div className="grid grid-cols-11 gap-1 text-center">
              {/* Header row */}
              <div className="font-bold">You</div>
              {['2','3','4','5','6','7','8','9','10','A'].map(card => (
                <div key={card} className="font-bold text-yellow-300">{card}</div>
              ))}

              {/* Strategy rows for common hands */}
              {[12, 13, 14, 15, 16, 17, 18, 19, 20].map(total => (
                <React.Fragment key={total}>
                  <div className="font-bold text-blue-300">{total}</div>
                  {basicStrategy.hard[total]?.map((play, idx) => (
                    <div
                      key={idx}
                      className={`text-xs font-bold ${
                        play === 'H' ? 'text-green-400' :
                          play === 'S' ? 'text-red-400' :
                            'text-purple-400'
                      }`}
                    >
                      {play}
                    </div>
                  )) || Array(10).fill(0).map((_, idx) => <div key={idx}>-</div>)}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-2 text-gray-400 text-xs">
              H = Hit, S = Stand, D = Double (or Hit if not allowed)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicStrategyHelper;