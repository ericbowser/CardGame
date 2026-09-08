import { useGameContext } from '../../context';
import {
    estimateEvDollars,
    estimatePlayerEvPercent,
    formatEvPercent,
    getEvRecommendation,
} from '../../utils/countingUtils';
import { countStatCellClass, countValueClass, evValueClass } from '../../utils/countDisplayStyles';

function EvEstimatePanel({ wagerAmount, compact = false }) {
    const { isDeckShuffled, trueCount, runningCount } = useGameContext();

    const evPercent = estimatePlayerEvPercent(trueCount);
    const evDollars = estimateEvDollars(wagerAmount, evPercent);
    const evTone = evValueClass(evPercent);

    return (
        <div className={`w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md ${compact ? 'p-3' : 'rounded-2xl p-4 sm:p-5'}`}>
            <h2 className={`font-bold text-white ${compact ? 'mb-2 text-sm' : 'mb-3 text-lg'}`}>Estimated EV</h2>

            {!isDeckShuffled ? (
                <p className="text-sm text-white/55">
                    Shuffle a shoe to estimate player edge from the true count.
                </p>
            ) : (
                <>
                    <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                        <div className={`rounded-lg border p-3 ${countStatCellClass(trueCount)}`}>
                            <div className="text-white/70">True count</div>
                            <div className={`mt-1 text-lg font-extrabold ${countValueClass(trueCount)}`}>
                                {trueCount > 0 ? `+${trueCount}` : trueCount}
                            </div>
                        </div>
                        <div className={`rounded-lg border p-3 ${countStatCellClass(runningCount)}`}>
                            <div className="text-white/70">Running count</div>
                            <div className={`mt-1 text-lg font-extrabold ${countValueClass(runningCount)}`}>
                                {runningCount > 0 ? `+${runningCount}` : runningCount}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <div className="text-sm text-white/55">Player edge</div>
                                <div className={`mt-1 text-3xl font-extrabold ${evTone}`}>
                                    {formatEvPercent(evPercent)}
                                </div>
                            </div>
                            {wagerAmount > 0 && (
                                <div className="text-right">
                                    <div className="text-sm text-white/55">EV / hand</div>
                                    <div className={`mt-1 text-xl font-bold ${evTone}`}>
                                        {evDollars >= 0 ? '+' : ''}${evDollars.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-white/45">at ${wagerAmount} bet</div>
                                </div>
                            )}
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-white/55">
                            {getEvRecommendation(evPercent)}
                        </p>
                    </div>

                    <p className="mt-3 text-[11px] leading-relaxed text-white/40">
                        Estimate assumes S17, DAS, and 3:2 blackjack using edge ≈ (TC − 1) × 0.5%.
                        Long-run average only — individual hands still vary widely.
                    </p>
                </>
            )}
        </div>
    );
}

export default EvEstimatePanel;
