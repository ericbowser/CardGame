import React from 'react';

/**
 * A helper function to get the correct, bundled image path for a card.
 * It now correctly formats the filename to match your assets (e.g., '2_of_clubs.png')
 * and uses a modern approach to resolve the path from within the /src directory.
 * @param {object} card - The card object, e.g., { rank: 'K', suit: '♥' }
 * @returns {string} The public URL to the card image.
 */
const getCardImagePath = (card) => {
  // Guard Clause: If the card object is invalid, we can't proceed.
  if (!card || !card.rank || !card.suit) {
    console.error("Invalid card data provided to getCardImagePath:", card);
    // Return a safe fallback. Note the use of `new URL` here as well.
    return new URL('../assets/images/card_back.png', import.meta.url).href;
  }

  // Map ranks to their string representation for the filename
  const rankMap = {
    'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack',
    '10': '10', '9': '9', '8': '8', '7': '7', '6': '6', '5': '5', '4': '4', '3': '3', '2': '2',
  };

  // Map suits to their full name for the filename
  const suitMap = {
    '♠': 'spades',
    '♣': 'clubs',
    '♥': 'hearts',
    '♦': 'diamonds',
  };

  const rankStr = rankMap[card.rank];
  const suitStr = suitMap[card.suit];

  // A final check to ensure the mapping was successful
  if (!rankStr || !suitStr) {
    console.error("Could not map rank or suit for card:", card);
    return new URL('../assets/images/card_back.png', import.meta.url).href;
  }

  const imageName = `${rankStr}_of_${suitStr}.png`;

  // This `new URL(...)` pattern is the modern, bundler-friendly way (used by Vite)
  // to handle dynamic asset paths inside the /src folder. It tells the bundler
  // to include the image and gives you the correct public path at runtime.
  try {
    return new URL(`../assets/images/${imageName}`, import.meta.url).href;
  } catch (error) {
    console.error(`Image not found for path: ../assets/images/${imageName}`, error);
    // Fallback to the card back if a specific card image is missing
    return new URL('../assets/images/card_back.png', import.meta.url).href;
  }
};

/**
 * Renders a single playing card image.
 * This component is now defensive against missing or invalid card data.
 * @param {object} props
 * @param {object} props.card - The card object to display.
 * @param {boolean} [props.hidden=false] - If true, displays the back of the card.
 */
const Card = ({ card, hidden = false }) => {
  // If the card is hidden OR if the card data is missing,
  // we render the card back. This prevents the component from crashing.
  if (hidden || !card) {
    // Use the same URL pattern for the fallback image to ensure it loads correctly.
    const cardBackPath = new URL('.src/assets/facedown4.png', import.meta.url).href;
    return (
      <img
        src={cardBackPath}
        alt="Card Back"
        className="w-32 h-auto rounded-md shadow-lg transition-transform duration-300"
      />
    );
  }

  // If we've made it this far, we know we have a valid card object.
  const imagePath = getCardImagePath(card);
  const altText = `${card.rank} of ${card.suit}`;

  return (
    <img
      src={imagePath}
      alt={altText}
      className="w-32 h-auto rounded-md shadow-lg transition-transform duration-300"
    />
  );
};

export default Card;