import React from "react";
import facedown from "../src/assets/facedown4.jpg";
import { Who, Action, GameState } from '../src/Utils';
import { useGameContext } from "../src/GameContext";

function Card() {
    const {
        // State
        playerCards,
        dealerCards,
        playerCount,
        dealerCount,
        showHoleCard,
        gameState,
        winner,

        // Actions
        playerHit,
        playerStay,
        handleDeal,
    } = useGameContext();

    // Render player cards with responsive layout
    const getPlayerCards = () => {
        if (!playerCards || playerCards.length === 0) return null;
        return playerCards.map((card, index) => (
            <div
                key={`player-card-${index}`}
                className="inline-block relative transition-all duration-300 rounded-xl"
                style={{
                    marginLeft: index > 0 ? `-70px` : '0',
                    zIndex: index,
                    transform: `translateY(${index * 3}px) rotate(${index * 2 - 2}deg)` // Slight rotation for natural look
                }}
            >
                <img
                    src={card}
                    alt={`Player card ${index + 1}`}
                    className="w-28 h-auto rounded-xl shadow-mint-lg border-2 border-white hover:scale-105 transition-transform duration-200"
                />
            </div>
        ));
    };

    // Render dealer cards with responsive layout
    const getDealerCards = () => {
        if (!dealerCards || dealerCards.length === 0) return null;
        return dealerCards.map((card, index) => {
            const isHoleCard = index === 1;

            return (
                <div
                    key={`dealer-card-${index}`}
                    className="inline-block relative transition-all duration-300 rounded-xl"
                    style={{
                        marginLeft: index > 0 ? `-70px` : '0',
                        zIndex: index,
                        transform: `translateY(${index * 3}px) rotate(${index * -2 + 2}deg)` // Opposite rotation from player
                    }}
                >
                    <img
                        src={isHoleCard && !showHoleCard ? facedown : card}
                        alt={`Dealer card ${index + 1}`}
                        className="w-28 h-auto rounded-xl shadow-mint-lg border-2 border-white hover:scale-105 transition-transform duration-200"
                    />
                    {/* Add a subtle overlay effect for hole card */}
                    {isHoleCard && !showHoleCard && (
                        <div className="absolute inset-0 bg-mint-500 bg-opacity-20 rounded-xl"></div>
                    )}
                </div>
            );
        });
    };

    // Get game status message
    const getGameStatusMessage = () => {
        if (!gameState) {
            return "Ready to play";
        }

        switch (gameState) {
            case GameState.DeckShuffled:
                return "Deck shuffled - Ready to deal";
            case GameState.CardsDealt:
                return "Dealing cards...";
            case GameState.PlayerPhase:
                return "Your turn - Hit or Stay?";
            case GameState.DealerPhase:
                return "Dealer's turn...";
            case GameState.GameConcluded:
                if (winner === "Push") {
                    return "Push! It's a tie!";
                } else if (winner === Who.Player) {
                    return "You win!";
                } else if (winner === Who.Dealer) {
                    return "Dealer wins!";
                }
                return "Round over";
            default:
                return "";
        }
    };

    const canPlayerAct = gameState === GameState.PlayerPhase;
    const isGameOver = gameState === GameState.GameConcluded;
    const showCards = gameState && (playerCards.length > 0 || dealerCards.length > 0);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Game status */}
            <div className="mb-8 text-center">
                <div className="bg-gradient-to-r from-mint-50 to-sage-50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-mint-200 shadow-mint">
                    <h3 className="text-3xl font-bold text-mint-700 mb-3">
                        {getGameStatusMessage()}
                    </h3>
                    {showCards && (
                        <div className="flex justify-center space-x-8">
                            <div className="bg-white rounded-xl p-3 shadow-mint border border-mint-100">
                            <span className="text-lg text-sage-700 font-bold">
                                🤖 Dealer: <span className="text-mint-600">{showHoleCard ? dealerCount : `${calculateHandValue([dealerCards[0]])} + ?`}</span>
                            </span>
                            </div>
                            <div className="bg-white rounded-xl p-3 shadow-mint border border-sage-100">
                            <span className="text-lg text-sage-700 font-bold">
                                👤 Player: <span className="text-mint-600">{playerCount}</span>
                            </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Winner announcement */}
                {winner && isGameOver && (
                    <div className="bg-gradient-to-r from-cream-200 to-cream-300 p-6 rounded-2xl shadow-mint-lg mb-6 border-2 border-cream-400">
                    <span className={`text-4xl font-bold ${
                        winner === Who.Player ? 'text-sage-600' :
                            winner === Who.Dealer ? 'text-mint-700' :
                                'text-mint-600'
                    }`}>
                        {winner === "Push" ? "🤝 Push!" : `🎉 ${winner} Wins!`}
                    </span>
                    </div>
                )}
            </div>

            {/* Dealer's cards */}
            <div className="mb-8 min-h-[220px]">
                <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 shadow-mint border border-mint-100">
                    <h2 className="text-2xl font-bold mb-6 text-sage-700 text-center flex items-center justify-center">
                        🤖 Dealer's Hand
                    </h2>
                    <div className="flex justify-center items-center h-48">
                        {showCards ? getDealerCards() : (
                            <div className="text-sage-400 text-xl italic font-medium text-center">
                                <div className="text-4xl mb-2">🎴</div>
                                Cards will appear here
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Player's cards */}
            <div className="mb-8 min-h-[220px]">
                <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 shadow-mint border border-sage-100">
                    <h2 className="text-2xl font-bold mb-6 text-mint-700 text-center flex items-center justify-center">
                        👤 Your Hand
                    </h2>
                    <div className="flex justify-center items-center h-48">
                        {showCards ? getPlayerCards() : (
                            <div className="text-mint-400 text-xl italic font-medium text-center">
                                <div className="text-4xl mb-2">🃏</div>
                                Your cards will appear here
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Game controls */}
            <div className="flex justify-center space-x-6 mt-8">
                {canPlayerAct && (
                    <>
                        <button
                            className="px-10 py-4 bg-gradient-to-r from-sage-400 to-sage-500 text-white text-xl font-bold rounded-2xl shadow-sage hover:from-sage-500 hover:to-sage-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                            onClick={playerHit}
                            disabled={!canPlayerAct}
                        >
                            ✋ Hit
                        </button>
                        <button
                            className="px-10 py-4 bg-gradient-to-r from-mint-400 to-mint-500 text-white text-xl font-bold rounded-2xl shadow-mint hover:from-mint-500 hover:to-mint-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                            onClick={playerStay}
                            disabled={!canPlayerAct}
                        >
                            ✋ Stay
                        </button>
                    </>
                )}

                {isGameOver && (
                    <button
                        className="px-10 py-4 bg-gradient-to-r from-mint-500 to-sage-500 text-white text-xl font-bold rounded-2xl shadow-mint-lg hover:from-mint-600 hover:to-sage-600 transform hover:scale-105 transition-all duration-200"
                        onClick={handleDeal}
                    >
                        🎴 Deal Again
                    </button>
                )}

                {/* Show loading state during dealer phase */}
                {gameState === GameState.DealerPhase && (
                    <div className="flex items-center space-x-3 bg-white bg-opacity-80 rounded-2xl px-6 py-4 shadow-mint border border-mint-200">
                        <div className="w-6 h-6 border-4 border-mint-300 border-t-mint-600 rounded-full animate-spin"></div>
                        <span className="text-mint-700 text-xl font-medium">🤖 Dealer thinking...</span>
                    </div>
                )}
            </div>

            {/* Hand value indicators */}
            {showCards && (
                <div className="mt-8 flex justify-center space-x-8 text-center">
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 shadow-mint border border-sage-100">
                        <div className="text-sage-600 text-sm font-medium mb-1">🤖 Dealer</div>
                        <div className={`text-3xl font-bold ${
                            showHoleCard ? (dealerCount > 21 ? 'text-red-500' : dealerCount === 21 ? 'text-cream-500' : 'text-mint-600') : 'text-sage-400'
                        }`}>
                            {showHoleCard ? dealerCount : '?'}
                        </div>
                    </div>
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 shadow-mint border border-mint-100">
                        <div className="text-mint-600 text-sm font-medium mb-1">👤 Player</div>
                        <div className={`text-3xl font-bold ${
                            playerCount > 21 ? 'text-red-500' : playerCount === 21 ? 'text-cream-500' : 'text-mint-600'
                        }`}>
                            {playerCount}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to calculate hand value for display purposes
function calculateHandValue(cards) {
    if (!cards || cards.length === 0) return 0;

    let total = 0;
    let aces = 0;

    cards.forEach(card => {
        if (card.includes('ace')) {
            aces++;
        } else if (card.includes('king') || card.includes('queen') || card.includes('jack') || card.includes('10')) {
            total += 10;
        } else {
            const match = card.match(/(\d+)_of/);
            if (match && match[1]) {
                total += parseInt(match[1], 10);
            }
        }
    });

    for (let i = 0; i < aces; i++) {
        total += (total + 11 <= 21) ? 11 : 1;
    }

    return total;
}

export default Card;