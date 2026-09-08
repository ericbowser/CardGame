import { GameState } from '../../constants/game';
import { AI_PLAYER_ID } from '../../constants/aiPlayer';
import { useGameContext } from '../../context';

const CHIP_STYLES = {
    5: 'bg-red-700 hover:bg-red-600',
    25: 'bg-green-700 hover:bg-green-600',
    50: 'bg-blue-700 hover:bg-blue-600',
    100: 'bg-purple-800 hover:bg-purple-700',
};

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
        playerHands,
        aiPlayerEnabled,
    } = useGameContext();

    const chipValues = [5, 25, 50, 100];

    const isRoundActive =
        gameState === GameState.PlayerPhase ||
        gameState === GameState.DealerPhase ||
        gameState === GameState.CardsDealt;

    const canBet = isDeckShuffled && !isRoundActive && !boardBusy && !aiPlayerEnabled;

    const clampBet = (value) => Math.min(Math.max(0, value), playerChips);

    const handlePlaceBet = () => {
        if (betAmount <= 0 || betAmount > playerChips) {
            return;
        }
        placeBetAndDeal(betAmount);
    };

    const handleBetChange = (e) => {
        const { value, valueAsNumber } = e.target;

        if (value === '') {
            setBetAmount(0);
            return;
        }

        if (Number.isNaN(valueAsNumber)) {
            return;
        }

        setBetAmount(clampBet(Math.floor(valueAsNumber)));
    };

    const handleChipClick = (value) => {
        setBetAmount(clampBet(value));
    };

    const adjustBet = (delta) => {
        setBetAmount(clampBet(betAmount + delta));
    };

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

                <div className="grid grid-cols-4 gap-2">
                    {chipValues.map((value) => (
                        <button
                            key={`chip-${value}`}
                            type="button"
                            data-testid={`chip-${value}`}
                            className={`rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-40 ${CHIP_STYLES[value]}`}
                            onClick={() => handleChipClick(value)}
                            disabled={!canBet || value > playerChips}
                        >
                            ${value}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => adjustBet(-5)}
                        className="rounded-l-lg bg-white/10 px-3 py-2.5 text-lg font-bold text-white disabled:opacity-40"
                        disabled={!canBet || betAmount <= 0}
                        aria-label="Decrease bet by 5"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={handleBetChange}
                        min="0"
                        max={playerChips}
                        step="5"
                        readOnly={!canBet}
                        aria-label="Bet amount"
                        data-testid="bet-input"
                        className={`min-w-0 flex-1 border-y border-white/20 bg-neutral-900 px-2 py-2.5 text-center text-lg font-bold tabular-nums text-amber-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${!canBet ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{ WebkitTextFillColor: 'rgb(253 230 138)' }}
                    />
                    <button
                        type="button"
                        onClick={() => setBetAmount(playerChips)}
                        className="rounded-r-lg bg-amber-500 px-3 py-2.5 text-xs font-bold text-black disabled:opacity-40"
                        disabled={!canBet}
                    >
                        Max
                    </button>
                </div>

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

                <div className="grid grid-cols-4 gap-0.5">
                    {chipValues.map((value) => (
                        <button
                            key={`chip-${value}`}
                            type="button"
                            data-testid={`chip-${value}`}
                            className={`rounded py-1 text-[9px] font-bold text-white disabled:opacity-40 ${CHIP_STYLES[value]}`}
                            onClick={() => handleChipClick(value)}
                            disabled={!canBet || value > playerChips}
                        >
                            {value}
                        </button>
                    ))}
                </div>

                <div className="flex gap-0.5">
                    <button
                        type="button"
                        onClick={() => adjustBet(-5)}
                        className="rounded-l bg-white/10 px-1.5 py-1 text-xs font-bold text-white disabled:opacity-40"
                        disabled={!canBet || betAmount <= 0}
                        aria-label="Decrease bet by 5"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={handleBetChange}
                        min="0"
                        max={playerChips}
                        step="5"
                        readOnly={!canBet}
                        aria-label="Bet amount"
                        data-testid="bet-input"
                        className={`min-w-0 flex-1 border-y border-white/20 bg-neutral-900 px-0.5 py-1 text-center text-xs font-bold tabular-nums text-amber-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${!canBet ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{ WebkitTextFillColor: 'rgb(253 230 138)' }}
                    />
                    <button
                        type="button"
                        onClick={() => setBetAmount(playerChips)}
                        className="rounded-r bg-amber-500 px-1.5 py-1 text-[8px] font-bold text-black disabled:opacity-40"
                        disabled={!canBet}
                    >
                        Max
                    </button>
                </div>

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
                        <div className="mt-1 text-3xl font-extrabold tabular-nums text-amber-300 sm:text-4xl" data-testid="bet-amount">
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

                <div className="mb-4 flex justify-center gap-2 sm:gap-3">
                    {chipValues.map((value) => (
                        <button
                            key={`chip-${value}`}
                            type="button"
                            data-testid={`chip-${value}`}
                            className={`h-11 w-11 rounded-full text-xs font-bold text-white shadow-lg transition hover:scale-110 disabled:opacity-40 sm:h-14 sm:w-14 sm:text-sm ${CHIP_STYLES[value]}`}
                            onClick={() => handleChipClick(value)}
                            disabled={!canBet || value > playerChips}
                        >
                            ${value}
                        </button>
                    ))}
                </div>

                <div className="mb-4 flex flex-wrap gap-0 sm:flex-nowrap">
                    <div className="flex shrink-0">
                        <button
                            type="button"
                            onClick={() => adjustBet(-5)}
                            className="rounded-l-lg bg-white/10 px-3 py-3 text-lg font-bold text-white transition hover:bg-white/20 disabled:opacity-40"
                            disabled={!canBet || betAmount <= 0}
                            aria-label="Decrease bet by 5"
                        >
                            −
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustBet(5)}
                            className="rounded-r-lg border-l border-white/10 bg-white/10 px-3 py-3 text-lg font-bold text-white transition hover:bg-white/20 disabled:opacity-40"
                            disabled={!canBet || betAmount >= playerChips}
                            aria-label="Increase bet by 5"
                        >
                            +
                        </button>
                    </div>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={handleBetChange}
                        min="0"
                        max={playerChips}
                        step="5"
                        readOnly={!canBet}
                        aria-label="Bet amount"
                        data-testid="bet-input"
                        className={`min-w-0 flex-1 basis-[4.5rem] border-y border-l-0 border-white/30 bg-neutral-900 p-3 text-center text-xl font-bold tabular-nums text-amber-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${!canBet ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{ WebkitTextFillColor: 'rgb(253 230 138)' }}
                    />
                    <button
                        type="button"
                        onClick={() => setBetAmount(0)}
                        className="border-l border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-40"
                        disabled={!canBet}
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={() => setBetAmount(playerChips)}
                        className="rounded-r-lg bg-amber-500 px-4 py-3 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-40"
                        disabled={!canBet}
                    >
                        Max
                    </button>
                </div>

                <p className="mt-4 text-center text-xs text-white/50">
                    Blackjack pays 3:2 · Regular wins pay 1:1
                </p>
            </div>
        </div>
    );
}

export default BettingSystem;
