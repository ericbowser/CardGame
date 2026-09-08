import { useGameContext } from '../../context';
import { AI_PLAYER_GOAL, AI_PLAYER_ID, AI_PLAYER_NAME } from '../../constants/aiPlayer';
import { describeAiBet } from '../../utils/counterBetSpread';
import { countValueClass, evValueClass } from '../../utils/countDisplayStyles';
import { formatEvPercent } from '../../utils/countingUtils';

function AiPlayerPanel({ compact = false, embedded = false }) {
    const {
        aiPlayerEnabled,
        setAiPlayerEnabled,
        aiWatchMode,
        setAiWatchMode,
        aiPlayerStatus,
        aiPlayerLastAction,
        isDeckShuffled,
        trueCount,
        playerChips,
        cardsRemaining,
        boardBusy,
    } = useGameContext();

    const { evPercent, label } = describeAiBet(trueCount, playerChips, cardsRemaining);
    const evTone = evValueClass(evPercent);
    const tcTone = countValueClass(trueCount);

    const statusLabel = {
        off: 'Offline',
        ready: 'Ready',
        betting: 'Betting…',
        playing: 'Playing…',
        watching: 'Dealer…',
        'between-rounds': 'Next bet…',
    }[aiPlayerStatus] ?? aiPlayerStatus;

    const canToggle = !boardBusy;

    const startWatching = () => {
        setAiWatchMode(true);
        setAiPlayerEnabled(true);
    };

    if (compact) {
        return (
            <div className="rounded-md border border-cyan-400/20 bg-cyan-950/30 px-2 py-1.5">
                {!aiPlayerEnabled ? (
                    <button
                        type="button"
                        data-testid="ai-watch-start"
                        disabled={!canToggle}
                        onClick={startWatching}
                        className="w-full rounded bg-gradient-to-r from-cyan-600 to-violet-600 py-1 text-[9px] font-bold text-white transition hover:from-cyan-500 hover:to-violet-500 disabled:opacity-40"
                    >
                        Watch {AI_PLAYER_ID}
                    </button>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-bold text-cyan-100">{statusLabel}</span>
                            <button
                                type="button"
                                data-testid="ai-player-toggle"
                                disabled={!canToggle}
                                onClick={() => setAiPlayerEnabled((prev) => !prev)}
                                className={`rounded px-1.5 py-0.5 text-[8px] font-bold disabled:opacity-40 ${
                                    aiPlayerEnabled
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-white/10 text-white'
                                }`}
                            >
                                {aiPlayerEnabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <button
                            type="button"
                            data-testid="ai-watch-mode"
                            disabled={!canToggle}
                            onClick={() => setAiWatchMode((prev) => !prev)}
                            className={`w-full rounded py-0.5 text-[8px] font-bold ${
                                aiWatchMode ? 'bg-violet-600/80 text-white' : 'bg-white/10 text-white/60'
                            }`}
                        >
                            Watch {aiWatchMode ? 'ON' : 'OFF'}
                        </button>
                        {isDeckShuffled && (
                            <div className="truncate text-[9px] text-amber-200/90">{label}</div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={embedded ? 'flex flex-col gap-3' : 'flex flex-col rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-cyan-950/40 to-white/5 p-4 sm:p-5'}>
            {!embedded && (
                <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-white">AI Counter</h2>
                        <p className="mt-0.5 text-xs text-cyan-200/70">{AI_PLAYER_GOAL}</p>
                    </div>
                    <span className="shrink-0 rounded border border-cyan-400/40 bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-cyan-200">
                        {AI_PLAYER_ID}
                    </span>
                </div>
            )}

            {!aiPlayerEnabled && (
                <button
                    type="button"
                    data-testid="ai-watch-start"
                    disabled={!canToggle}
                    onClick={startWatching}
                    className={`w-full rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 font-bold text-white transition hover:from-cyan-500 hover:to-violet-500 disabled:opacity-40 ${embedded ? 'py-3.5 text-base' : 'mb-3 py-3 text-sm'}`}
                >
                    Watch {AI_PLAYER_ID} play
                </button>
            )}

            <div className="mb-3 rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-white/50">
                            {AI_PLAYER_NAME}
                        </div>
                        <div className="mt-1 text-sm font-bold text-cyan-100">{statusLabel}</div>
                    </div>
                    <button
                        type="button"
                        data-testid="ai-player-toggle"
                        disabled={!canToggle}
                        onClick={() => setAiPlayerEnabled((prev) => !prev)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            aiPlayerEnabled
                                ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                                : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        {aiPlayerEnabled ? 'AI ON' : 'AI OFF'}
                    </button>
                </div>

                {aiPlayerEnabled && (
                    <label className="mt-3 flex cursor-pointer items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-xs text-white/60">Watch mode (slower, easier to follow)</span>
                        <button
                            type="button"
                            data-testid="ai-watch-mode"
                            disabled={!canToggle}
                            onClick={() => setAiWatchMode((prev) => !prev)}
                            className={`rounded-lg px-3 py-1 text-xs font-bold transition disabled:opacity-40 ${
                                aiWatchMode
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-white/10 text-white/70'
                            }`}
                        >
                            {aiWatchMode ? 'ON' : 'OFF'}
                        </button>
                    </label>
                )}

                {aiPlayerEnabled && aiPlayerLastAction && (
                    <p className="mt-2 border-t border-white/10 pt-2 font-mono text-[11px] leading-relaxed text-cyan-100/90">
                        {aiPlayerLastAction}
                    </p>
                )}
            </div>

            {aiPlayerEnabled && isDeckShuffled && (
                <div className="space-y-2 text-sm">
                    <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                        <div className="text-white/55">Next bet (count + EV)</div>
                        <div className="mt-1 font-bold text-amber-200">{label}</div>
                        <div className="mt-2 flex gap-3 text-xs">
                            <span className={tcTone}>
                                TC {trueCount > 0 ? `+${trueCount}` : trueCount}
                            </span>
                            <span className={evTone}>EV {formatEvPercent(evPercent)}</span>
                        </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-white/45">
                        Perfect Hi-Lo count + basic strategy. Bets ramp with true count and EV;
                        negative shoes stay at minimum.
                    </p>
                </div>
            )}

            {!isDeckShuffled && aiPlayerEnabled && (
                <p className="text-xs text-cyan-200/60">
                    Shuffle a 1-deck shoe — {AI_PLAYER_ID} will take over betting and play.
                </p>
            )}
        </div>
    );
}

export default AiPlayerPanel;
