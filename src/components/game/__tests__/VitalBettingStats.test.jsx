/**
 * @jest-environment jsdom
 */
import React from 'react';
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { render, screen, cleanup } from '@testing-library/react';
import { GameState } from '../../../constants/game';
import VitalBettingStats from '../VitalBettingStats';

const mockUseGameContext = jest.fn();

jest.mock('../../../context', () => ({
    useGameContext: () => mockUseGameContext(),
}));

function mockContext(overrides = {}) {
    return {
        playerChips: 1000,
        handResults: [],
        gameState: null,
        roundOver: false,
        trueCount: 0,
        runningCount: 0,
        cardsRemaining: 52,
        isDeckShuffled: true,
        ...overrides,
    };
}

beforeEach(() => {
    cleanup();
    mockUseGameContext.mockReset();
});

describe('VitalBettingStats', () => {
    test('renders bankroll and count panel when the shoe is live', () => {
        mockUseGameContext.mockReturnValue(
            mockContext({
                playerChips: 1250,
                trueCount: 3,
                runningCount: 6,
                cardsRemaining: 40,
            }),
        );

        render(<VitalBettingStats />);

        expect(screen.getByTestId('player-chips')).toHaveTextContent('$1250');
        expect(screen.getByTestId('true-count')).toHaveTextContent('+3');
        expect(screen.getByTestId('running-count')).toHaveTextContent('+6');
        expect(screen.getByTestId('ev-percent')).toHaveTextContent('+1.0%');
        expect(screen.getByTestId('last-hand-pnl')).toHaveTextContent('—');
    });

    test('hides count / bet panel before the shoe is shuffled', () => {
        mockUseGameContext.mockReturnValue(mockContext({ isDeckShuffled: false }));

        render(<VitalBettingStats />);

        expect(screen.getByTestId('player-chips')).toHaveTextContent('$1000');
        expect(screen.queryByTestId('true-count')).toBeNull();
        expect(screen.queryByTestId('suggested-bet')).toBeNull();
    });

    test('shows last-hand P&L when the round is over', () => {
        mockUseGameContext.mockReturnValue(
            mockContext({
                roundOver: true,
                handResults: [
                    { outcome: 'win', amount: 50 },
                    { outcome: 'loss', amount: -25 },
                ],
            }),
        );

        render(<VitalBettingStats />);

        expect(screen.getByTestId('last-hand-pnl')).toHaveTextContent('+$25');
        expect(screen.getByText('Last hand')).toBeTruthy();
    });

    test('labels P&L as live during player / dealer action', () => {
        mockUseGameContext.mockReturnValue(
            mockContext({
                gameState: GameState.PlayerPhase,
                roundOver: true,
                handResults: [{ outcome: 'loss', amount: -10 }],
            }),
        );

        render(<VitalBettingStats />);

        expect(screen.getByText('Live P&L')).toBeTruthy();
        expect(screen.getByTestId('last-hand-pnl')).toHaveTextContent('-$10');
    });

    test('suggests $0 when Wonging out on a deeply negative count', () => {
        mockUseGameContext.mockReturnValue(
            mockContext({
                trueCount: -3,
                runningCount: -6,
                cardsRemaining: 30,
                playerChips: 1000,
            }),
        );

        render(<VitalBettingStats />);

        expect(screen.getByTestId('suggested-bet')).toHaveTextContent('$0');
    });

    test('ramps suggested bet with a positive running count', () => {
        mockUseGameContext.mockReturnValue(
            mockContext({
                trueCount: 4,
                runningCount: 8,
                cardsRemaining: 52,
                playerChips: 1000,
            }),
        );

        render(<VitalBettingStats />);

        // RC +8 / 1 deck → spread TC 8 → max 30u = $150
        expect(screen.getByTestId('suggested-bet')).toHaveTextContent('$150');
        expect(screen.getByTestId('suggested-bet')).toHaveTextContent('52c');
    });
});
