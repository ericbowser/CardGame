import { GameState } from '../../constants/game';
import { useGameContext } from '../../context';
import EvEstimatePanel from './EvEstimatePanel';

const CHIP_STYLES = {
    5: 'bg-red-700 hover:bg-red-600',
    25: 'bg-green-700 hover:bg-green-600',
    50: 'bg-blue-700 hover:bg-blue-600',
    100: 'bg-purple-800 hover:bg-purple-700',
};

function BettingSystem() {
    const {
        playerChips,
        currentBet,
        gameState,
        isDeckShuffled,
        placeBetAndDeal,
        betAmount,
        setBetAmount,
    } = useGameContext();

    const chipValues = [5, 25, 50, 100];

    const isRoundActive =
        gameState === GameState.PlayerPhase ||
        gameState === GameState.DealerPhase ||
        gameState === GameState.CardsDealt;

    const canBet = isDeckShuffled && !isRoundActive;

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
        setBetAmount(clampBet(betAmount + value));
    };

    const adjustBet = (delta) => {
        setBetAmount(clampBet(betAmount + delta));
    };

    return (
        <div className="flex w-full flex-col gap-3">
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-center text-xl font-bold text-white">Place Your Bet</h2>

            <div className="mb-4 rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="mb-3 border-b border-white/10 pb-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-white/55">Bet amount</div>
                    <div className="mt-1 text-4xl font-extrabold tabular-nums text-amber-300">
                        ${betAmount}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/80">Chips</span>
                    <span className="text-2xl font-extrabold text-amber-300">${playerChips}</span>
                </div>
                {currentBet > 0 && (
                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                        <span className="font-semibold text-white/80">Current Bet</span>
                        <span className="text-xl font-extrabold text-emerald-300">${currentBet}</span>
                    </div>
                )}
            </div>

            {!isDeckShuffled && (
                <p className="mb-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center text-xs text-white/60">
                    Shuffle the deck to enable betting.
                </p>
            )}

            <div className="mb-4 flex justify-center gap-3">
                {chipValues.map((value) => (
                    <button
                        key={`chip-${value}`}
                        type="button"
                        className={`h-14 w-14 rounded-full text-sm font-bold text-white shadow-lg transition hover:scale-110 disabled:opacity-40 ${CHIP_STYLES[value]}`}
                        onClick={() => handleChipClick(value)}
                        disabled={!canBet || betAmount + value > playerChips}
                    >
                        ${value}
                    </button>
                ))}
            </div>

            <div className="mb-4 flex gap-0">
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
                    className={`min-w-0 flex-1 border-y border-l-0 border-white/30 bg-neutral-900 p-3 text-center text-xl font-bold tabular-nums text-amber-100 caret-amber-400 [color-scheme:dark] focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${!canBet ? 'cursor-not-allowed opacity-70' : ''}`}
                    style={{ WebkitTextFillColor: 'rgb(253 230 138)' }}
                />
                <button
                    type="button"
                    onClick={() => setBetAmount(0)}
                    className="border-l border-white/10 bg-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/20 disabled:opacity-40"
                    disabled={!canBet}
                >
                    Clear
                </button>
                <button
                    type="button"
                    onClick={() => setBetAmount(playerChips)}
                    className="rounded-r-lg bg-amber-500 px-4 py-3 font-medium text-black transition hover:bg-amber-400 disabled:opacity-40"
                    disabled={!canBet}
                >
                    Max
                </button>
            </div>

            <button
                type="button"
                onClick={handlePlaceBet}
                className="w-full rounded-xl bg-emerald-600 py-3 text-lg font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canBet || betAmount <= 0 || betAmount > playerChips}
            >
                Place Bet & Deal
            </button>

            <p className="mt-4 text-center text-xs text-white/50">
                Blackjack pays 3:2 · Regular wins pay 1:1
            </p>
            </div>

            <EvEstimatePanel wagerAmount={betAmount} />
        </div>
    );
}

export default BettingSystem;
