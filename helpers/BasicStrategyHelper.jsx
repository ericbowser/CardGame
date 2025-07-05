import React from 'react';

// Basic strategy chart for single deck blackjack
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

// Convert dealer card to index (2-10, A)
const getDealerIndex = (dealerCard) => {
  if (dealerCard.includes('ace')) return 9;
  if (dealerCard.includes('king') || dealerCard.includes('queen') ||
    dealerCard.includes('jack') || dealerCard.includes('10')) return 8;

  const match = dealerCard.match(/(\d+)_of/);
  if (match && match[1]) {
    return parseInt(match[1]) - 2; // 2 becomes 0, 3 becomes 1, etc.
  }
  return 0;
};

// Determine if hand is soft (has an ace counted as 11)
const isSoftHand = (cards, total) => {
  const hasAce = cards.some(card => card.includes('ace'));
  return hasAce && total <= 21 && total >= 12 && total <= 21;
};

const BasicStrategyHelper = ({ playerCards, dealerUpCard, playerTotal, isPlayerTurn }) => {
  if (!isPlayerTurn || !playerCards.length || !dealerUpCard) {
    return null;
  }

  // Get the optimal play based on basic strategy
  const dealerIndex = getDealerIndex(dealerUpCard);
  const isSoft = isSoftHand(playerCards, playerTotal);

  let optimalPlay = 'S'; // Default to Stand

  if (playerTotal <= 21) {
    if (isSoft && basicStrategy.soft[playerTotal]) {
      optimalPlay = basicStrategy.soft[playerTotal][dealerIndex];
    } else if (basicStrategy.hard[playerTotal]) {
      optimalPlay = basicStrategy.hard[playerTotal][dealerIndex];
    }
  }

  // Convert strategy code to readable action
  const actionMap = {
    'H': 'Hit',
    'S': 'Stand',
    'D': 'Double (or Hit if not allowed)'
  };

  const action = actionMap[optimalPlay] || 'Stand';

  return (
    <div className="bg-blue-800 bg-opacity-80 p-4 rounded-lg shadow-lg mb-4">
      <h3 className="text-white font-bold mb-2">Basic Strategy Recommendation</h3>
      <div className="text-white">
        <p className="mb-1">Your hand: {playerTotal} {isSoft ? '(soft)' : '(hard)'}</p>
        <p className="mb-1">Dealer shows: {dealerUpCard.split('_')[0].toUpperCase()}</p>
        <p className="text-yellow-300 font-bold text-lg">Optimal Play: {action}</p>
      </div>
    </div>
  );
};

export default BasicStrategyHelper;