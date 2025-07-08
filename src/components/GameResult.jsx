import React from 'react';
import { useGameContext } from '../GameContext';
import { GameState } from '../Utils';

/**
 * Displays the result of the round (e.g., winner, bust).
 * It only renders a message when the round has concluded.
 */
const GameResult = () => {
  const { winner, gameState } = useGameContext();

  // We only want to show the result message at the end of a round.
  const isRoundOver =
    gameState === GameState.RoundOver || gameState === GameState.PlayerBusted;

  if (!isRoundOver || !winner) {
    // Don't render anything if the round is in progress or there's no winner yet.
    return null;
  }

  let message = '';
  let messageClass = 'game-result-message';

  switch (winner) {
    case 'Player':
      message = 'You Win!';
      messageClass += ' win';
      break;
    case 'Dealer':
      message = 'Dealer Wins!';
      messageClass += ' lose';
      break;
    case 'Push':
      message = 'Push!';
      messageClass += ' push';
      break;
    default:
      // If there's no winner text, don't show anything.
      return null;
  }

  return (
    <div className="game-result-container">
      <h2 className={messageClass}>{message}</h2>
    </div>
  );
};

export default GameResult;