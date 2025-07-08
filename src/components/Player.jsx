import React from 'react';
import Card from './Card'; // Import the new reusable component

/**
 * Displays the player's hand, score, and status.
 * This is a "presentational" component that receives all its data via props.
 * @param {object} props
 * @param {Array<object>} props.hand - The array of card objects in the player's hand.
 * @param {number} props.score - The calculated score of the player's hand.
 */
const Player = ({ hand, score }) => {
  return (
    <div className="player-area">
      {/* The score is now passed in as a prop for better performance and separation of concerns. */}
      <h2>Player's Hand ({score})</h2>

      <div className="hand">
        {/* Map over the hand and render a Card component for each card */}
        {hand.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>

      {score > 21 && <h3 className="busted-message">Busted!</h3>}
    </div>
  );
};

export default Player;