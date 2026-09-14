import { useEffect, useState } from 'react';
import { GameState } from '../../constants/game';
import { AI_PLAYER_ID } from '../../constants/aiPlayer';
import { useGameContext } from '../../context';

const CHIP_STYLES = {
    5: 'bg-red-700 hover:bg-red-600',
    10: 'bg-orange-700 hover:bg-orange-600',
    25: 'bg-green-700 hover:bg-green-600',
    50: 'bg-blue-700 hover:bg-blue-600',
    100: 'bg-purple-800 hover:bg-purple-700',
};

const CHIP_VALUES = [5, 10, 25, 50, 100];

/** Digits only — no decimals, signs, or exponents. */
function parseWholeBet(raw) {
    if (raw === '') {
        return { ok: true, value: 0, draft: '' };
    }
    if (!/^\d+$/.test(raw)) {
        return { ok: false };
    }
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value) || value < 0) {
        return { ok: false };
    }
    return { ok: true, value, draft: String(value) };
}

function BettingSystem({ compact = false, rail = false }) {
    const {
        playerChips,
        currentBet,
        gameState,
        isDeckShuffled,
        placeBetAndDeal,
        betAmount,
        setBetAmount,
        boardBusy,
        aiPlayerEnabled,
    } = useGameContext();

    const [betDraft, setBetDraft] = useState(String(betAmount ?? 0));

    useEffect(() => {
        setBetDraft(String(betAmount ?? 0));
    }, [betAmount]);

    const isRoundActive =
        gameState === GameState.PlayerPhase ||
        gameState === GameState.DealerPhase ||
        gameState === GameState.CardsDealt;

    const canBet = isDeckShuffled && !isRoundActive && !boardBusy && !aiPlayerEnabled;

    const clampBet = (value) => Math.min(Math.max(0, Math.trunc(value)), playerChips);

    const handlePlaceBet = () => {
        if (betAmount <= 0 || betAmount > playerChips) {
            return;
        }
        placeBetAndDeal(betAmount);
    };

    /** Chip buttons replace the bet entirely (not cumulative). */
    const handleChipClick = (value) => {
        const next = clampBet(value);
        setBetAmount(next);
        setBetDraft(String(next));
    };

    const handleBetInputChange = (event) => {
        const { value } = event.target;
        const parsed = parseWholeBet(value);
        if (!parsed.ok) {
            return;
        }

        if (parsed.draft === '') {
            setBetDraft('');
            setBetAmount(0);
            return;
        }

        const next = clampBet(parsed.value);
        setBetDraft(parsed.draft);
        setBetAmount(next);
    };

    const handleBetInputBlur = () => {
        const next = clampBet(betAmount);
        setBetAmount(next);
        setBetDraft(String(next));
    };

    const clearBet = () => {
        setBetAmount(0);
        setBetDraft('0');
    };

    const maxBet = () => {
        const next = clampBet(playerChips);
        setBetAmount(next);
        setBetDraft(String(next));
    };

    const chipGridClass = compact
        ? 'grid grid-cols-5 gap-0.5'
        : rail
          ? 'grid grid-cols-5 gap-2'
          : 'mb-4 flex flex-wrap justify-center gap-2 sm:gap-3';

    const chipButtonClass = (value) => {
        const selected = canBet && betAmount === value;
        const base = CHIP_STYLES[value] ?? 'bg-white/20 hover:bg-white/30';
        if (compact) {
            return `rounded py-1 text-[9px] font-bold text-white disabled:opacity-40 ${base} ${selected ? 'ring-2 ring-amber-300' : ''}`;
        }
        if (rail) {
            return `rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-40 ${base} ${selected ? 'ring-2 ring-amber-300' : ''}`;
        }
        return `h-11 w-11 rounded-full text-xs font-bold text-white shadow-lg transition hover:scale-110 disabled:opacity-40 sm:h-14 sm:w-14 sm:text-sm ${base} ${selected ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-black' : ''}`;
    };

    const inputClass = compact
        ? `min-w-0 flex-1 border border-white/20 bg-neutral-900 px-0.5 py-1 text-center text-xs font-bold tabular-nums text-amber-100 ${!canBet ? 'cursor-not-allowed opacity-70' : ''}`
        : rail
          ? `min-w-0 flex-1 rounded-lg border border-white/20 bg-neutral-900 px-2 py-2.5 text-center text-lg font-bold tabular-nums text-amber-100 ${!canBet ? 'cursor-not-allowed opacity-70' : ''}`
          : `min-w-0 flex-1 basis-[4.5rem] rounded-lg border border-white/30 bg-neutral-900 p-3 text-center text-xl font-bold tabular-nums text-amber-100 ${!canBet ? 'cursor-not-allowed opacity-70' : ''}`;

    const chipsBlock = (
        <div className={chipGridClass}>
            {CHIP_VALUES.map((value) => (
                <button
                    key={`chip-${value}`}
                    type="button"
                    data-testid={`chip-${value}`}
                    className={chipButtonClass(value)}
                    onClick={() => handleChipClick(value)}
                    disabled={!canBet || value > playerChips}
                    aria-pressed={betAmount === value}
                    title={`Set bet to $${value}`}
                >
                    {compact ? value : `$${value}`}
                </button>
            ))}
        </div>
    );

    const manualBetBlock = (
        <div className={`flex gap-1 ${compact ? '' : rail ? '' : 'mb-4'}`}>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={betDraft}
                onChange={handleBetInputChange}
                onBlur={handleBetInputBlur}
                readOnly={!canBet}
                aria-label="Bet amount (whole dollars)"
                data-testid="bet-input"
                placeholder="0"
                className={inputClass}
                style={{ WebkitTextFillColor: 'rgb(253 230 138)' }}
            />
            <button
                type="button"
                onClick={clearBet}
                className={`bg-white/10 font-medium text-white transition hover:bg-white/20 disabled:opacity-40 ${compact ? 'rounded px-1.5 py-1 text-[8px]' : rail ? 'rounded-lg px-3 py-2.5 text-xs' : 'rounded-lg px-4 py-3 text-sm'}`}
                disabled={!canBet}
            >
                Clear
            </button>
            <button
                type="button"
                onClick={maxBet}
                className={`bg-amber-500 font-bold text-black transition hover:bg-amber-400 disabled:opacity-40 ${compact ? 'rounded px-1.5 py-1 text-[8px]' : rail ? 'rounded-lg px-3 py-2.5 text-xs' : 'rounded-lg px-4 py-3 text-sm'}`}
                disabled={!canBet}
            >
                Max
            </button>
        </div>
    );

    if (rail) {
        return (
            <div className="flex flex-col gap-3 text-sm">
                {aiPlayerEnabled && (
                    <div className="rounded-lg border border-cyan-400/30 bg-cyan-950/50 px-3 py-2 text-center text-xs font-medium text-cyan-100">
                        {AI_PLAYER_ID} controls betting
                    </div>
                )}

                <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/45">Bet amount</span>
                    <span className="text-2xl font-extrabold tabular-nums text-amber-300" data-testid="bet-amount">
                        ${betAmount}
                    </span>
                </div>

                {currentBet > 0 && isRoundActive && (
                    <div className="flex justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60">
                        <span>At risk this round</span>
                        <span className="font-bold text-emerald-300">${currentBet}</span>
                    </div>
                )}

                {!isDeckShuffled && (
                    <p className="text-center text-sm text-white/45">Shuffle the shoe to enable betting.</p>
                )}

                <p className="text-[11px] text-white/40">Chips set the bet (replace, not add).</p>
                {chipsBlock}
                {manualBetBlock}

                <button
                    type="button"
                    data-testid="place-bet-deal"
                    onClick={handlePlaceBet}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
                >
                    Bet & Deal
                </button>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex shrink-0 flex-col gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
                {aiPlayerEnabled && (
                    <div className="text-center text-[8px] font-medium text-cyan-200/80">
                        {AI_PLAYER_ID} betting
                    </div>
                )}

                <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] text-white/45">Bet</span>
                    <span className="text-sm font-extrabold tabular-nums text-amber-300" data-testid="bet-amount">
                        ${betAmount}
                    </span>
                </div>

                {currentBet > 0 && isRoundActive && (
                    <div className="flex justify-between text-[9px] text-white/50">
                        <span>At risk</span>
                        <span className="font-bold text-emerald-300">${currentBet}</span>
                    </div>
                )}

                {!isDeckShuffled && (
                    <p className="text-center text-[9px] text-white/45">Shuffle to bet</p>
                )}

                {chipsBlock}
                {manualBetBlock}

                <button
                    type="button"
                    data-testid="place-bet-deal"
                    onClick={handlePlaceBet}
                    className="w-full rounded bg-emerald-600 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
                >
                    Bet & Deal
                </button>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-3">
            {aiPlayerEnabled && (
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-950/50 px-2 py-1.5 text-center text-[10px] font-medium text-cyan-100">
                    {AI_PLAYER_ID} controls betting
                </div>
            )}
            <button
                type="button"
                data-testid="place-bet-deal"
                onClick={handlePlaceBet}
                className="w-full rounded-xl bg-emerald-600 py-3 text-lg font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
            >
                Place Bet & Deal
            </button>

            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <h2 className="mb-3 text-center text-lg font-bold text-white sm:mb-4 sm:text-xl">
                    Place Your Bet
                </h2>

                <div className="mb-4 rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="mb-3 border-b border-white/10 pb-3 text-center">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
                            Bet amount
                        </div>
                        <div
                            className="mt-1 text-3xl font-extrabold tabular-nums text-amber-300 sm:text-4xl"
                            data-testid="bet-amount"
                        >
                            ${betAmount}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-white/80">Chips</span>
                        <span className="text-2xl font-extrabold text-amber-300" data-testid="player-chips">
                            ${playerChips}
                        </span>
                    </div>
                    {currentBet > 0 && (
                        <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-white/80">
                                    {isRoundActive ? 'Round wager' : 'Current Bet'}
                                </span>
                                <span className="text-xl font-extrabold text-emerald-300">${currentBet}</span>
                            </div>
                        </div>
                    )}
                </div>

                {!isDeckShuffled && (
                    <p className="mb-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center text-xs text-white/60">
                        Shuffle the deck to enable betting.
                    </p>
                )}

                <p className="mb-2 text-center text-xs text-white/45">
                    Tap a chip to set that bet — amounts replace, they do not stack.
                </p>
                {chipsBlock}
                <p className="mb-2 text-center text-xs text-white/45">Or type a whole-dollar amount</p>
                {manualBetBlock}

                <p className="mt-4 text-center text-xs text-white/50">
                    Blackjack pays 3:2 · Regular wins pay 1:1
                </p>
            </div>
        </div>
    );
}

export default BettingSystem;
export { parseWholeBet };
