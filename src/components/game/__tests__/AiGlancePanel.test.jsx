/**
 * @jest-environment jsdom
 */
import React from 'react';
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { render, screen, cleanup } from '@testing-library/react';
import { GameState } from '../../../constants/game';
import AiGlancePanel from '../AiGlancePanel';

const mockUseGameContext = jest.fn();

jest.mock('../../../context', () => ({
    useGameContext: () => mockUseGameContext(),
}));

function mockContext(overrides = {}) {
    return {
        aiPlayerEnabled: true,
        aiPlayerStatus: 'playing',
        aiPlayerLastAction: 'CNT-AI-7 → HIT (hand 1)',
        aiWatchMode: true,
        trueCount: 3,
        runningCount: 6,
        cardsRemaining: 40,
        playerChips: 1180,
        currentBet: 50,
        betAmount: 50,
        playerHands: [
            {
                cards: ['/cards/10_of_spades.png', '/cards/6_of_hearts.png'],
                bet: 50,
                status: 'playing',
            },
        ],
        activeHandIndex: 0,
        dealerCards: ['/cards/10_of_clubs.png'],
        canSplit: false,
        gameState: GameState.PlayerPhase,
        isDeckShuffled: true,
        boardBusy: false,
        ...overrides,
    };
}

beforeEach(() => {
    cleanup();
    mockUseGameContext.mockReset();
});

describe('AiGlancePanel', () => {
    test('shows placeholder when AI is off', () => {
        mockUseGameContext.mockReturnValue(mockContext({ aiPlayerEnabled: false }));

        render(<AiGlancePanel />);

        expect(screen.getByTestId('ai-glance-panel')).toBeTruthy();
        expect(screen.getByText(/turn on/i)).toBeTruthy();
        expect(screen.queryByTestId('ai-glance-table-bet')).toBeNull();
    });

    test('streams bankroll, bets, counts, and play decision while AI acts', () => {
        mockUseGameContext.mockReturnValue(mockContext());

        render(<AiGlancePanel />);

        expect(screen.getByTestId('ai-glance-status')).toHaveTextContent('Acting');
        expect(screen.getByTestId('ai-glance-last-action')).toHaveTextContent('HIT');
        expect(screen.getByTestId('ai-glance-bankroll')).toHaveTextContent('$1180');
        expect(screen.getByTestId('ai-glance-table-bet')).toHaveTextContent('$50');
        expect(screen.getByTestId('ai-glance-tc')).toHaveTextContent('+3');
        expect(screen.getByTestId('ai-glance-rc')).toHaveTextContent('+6');
        expect(screen.getByTestId('ai-glance-action')).toHaveTextContent('stand');
    });

    test('shows bet rationale and next wager between hands', () => {
        mockUseGameContext.mockReturnValue(
            mockContext({
                aiPlayerStatus: 'ready',
                aiPlayerLastAction: 'CNT-AI-7 → $50 · TC +3',
                gameState: GameState.GameConcluded,
                playerHands: [],
                currentBet: 0,
            }),
        );

        render(<AiGlancePanel />);

        expect(screen.getByTestId('ai-glance-next-bet')).toHaveTextContent('$');
        expect(screen.getByTestId('ai-glance-bet-label')).toHaveTextContent('TC');
        expect(screen.queryByTestId('ai-glance-play')).toBeNull();
    });
});
