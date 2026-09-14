/**
 * @jest-environment jsdom
 */
import React from 'react';
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import BettingSystem, { parseWholeBet } from '../BettingSystem';

const mockUseGameContext = jest.fn();
const setBetAmount = jest.fn();
const placeBetAndDeal = jest.fn();

jest.mock('../../../context', () => ({
    useGameContext: () => mockUseGameContext(),
}));

function mockContext(overrides = {}) {
    return {
        playerChips: 1000,
        currentBet: 0,
        gameState: null,
        isDeckShuffled: true,
        placeBetAndDeal,
        betAmount: 25,
        setBetAmount,
        boardBusy: false,
        aiPlayerEnabled: false,
        ...overrides,
    };
}

beforeEach(() => {
    cleanup();
    mockUseGameContext.mockReset();
    setBetAmount.mockReset();
    placeBetAndDeal.mockReset();
});

describe('parseWholeBet', () => {
    test('accepts empty and whole dollars only', () => {
        expect(parseWholeBet('')).toEqual({ ok: true, value: 0, draft: '' });
        expect(parseWholeBet('40')).toEqual({ ok: true, value: 40, draft: '40' });
        expect(parseWholeBet('0')).toEqual({ ok: true, value: 0, draft: '0' });
    });

    test('rejects decimals, signs, and non-digits', () => {
        expect(parseWholeBet('12.5').ok).toBe(false);
        expect(parseWholeBet('1/2').ok).toBe(false);
        expect(parseWholeBet('-5').ok).toBe(false);
        expect(parseWholeBet('1e2').ok).toBe(false);
        expect(parseWholeBet('abc').ok).toBe(false);
    });
});

describe('BettingSystem', () => {
    test('chip click replaces the bet instead of adding', () => {
        mockUseGameContext.mockReturnValue(mockContext({ betAmount: 50 }));

        render(<BettingSystem rail />);

        fireEvent.click(screen.getByTestId('chip-25'));
        expect(setBetAmount).toHaveBeenCalledWith(25);
        expect(setBetAmount).not.toHaveBeenCalledWith(75);
    });

    test('manual input accepts whole numbers and rejects decimals', () => {
        mockUseGameContext.mockReturnValue(mockContext({ betAmount: 0 }));

        render(<BettingSystem rail />);
        const input = screen.getByTestId('bet-input');

        fireEvent.change(input, { target: { value: '75' } });
        expect(setBetAmount).toHaveBeenCalledWith(75);

        setBetAmount.mockClear();
        fireEvent.change(input, { target: { value: '12.5' } });
        expect(setBetAmount).not.toHaveBeenCalled();
    });

    test('manual input clamps to available chips', () => {
        mockUseGameContext.mockReturnValue(mockContext({ playerChips: 40, betAmount: 0 }));

        render(<BettingSystem rail />);
        fireEvent.change(screen.getByTestId('bet-input'), { target: { value: '100' } });
        expect(setBetAmount).toHaveBeenCalledWith(40);
    });
});
