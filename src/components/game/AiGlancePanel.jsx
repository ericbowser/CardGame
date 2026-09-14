import { AI_PLAYER_ID, AI_PLAYER_NAME } from '../../constants/aiPlayer';
import { GameState } from '../../constants/game';
import { TABLE_RULES } from '../../constants/rules';
import { useGameContext } from '../../context';
import { calculateHandValue } from '../../utils/cardUtils';
import {
    COUNTER_GOAL_DOUBLE,
    describeAiBet,
    resolveAiPlayAction,
} from '../../utils/counterBetSpread';
import {
    formatEvPercent,
    getSpreadTrueCount,
} from '../../utils/countingUtils';
import { countValueClass, evValueClass } from '../../utils/countDisplayStyles';
import { canSplitHand } from '../../utils/handUtils';

const STATUS_COPY = {
    off: 'Offline',
    ready: 'Ready',
    betting: 'Sizing bet…',
    playing: 'Acting…',
    watching: 'Watching dealer…',
    wonging: 'Wonging out…',
    'between-rounds': 'Between hands…',
};

function StatCell({ label, children, testId, className = '' }) {
    return (
        <div
            className={`rounded-lg border border-white/10 bg-black/40 px-2 py-2 ${className}`}
            data-testid={testId}
        >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                {label}
            </div>
            <div className="mt-0.5 text-base font-extrabold tabular-nums leading-tight text-white">
                {children}
            </div>
        </div>
    );
}

/**
 * At-a-glance AI telemetry beside the table — bet sizing, counts, and play choice.
 * Intentionally redundant with the settings rail for watch/debug.
 */
function AiGlancePanel() {
    const {
        aiPlayerEnabled,
        aiPlayerStatus,
        aiPlayerLastAction,
        aiWatchMode,
        trueCount,
        runningCount,
        cardsRemaining,
        playerChips,
        currentBet,
        betAmount,
        playerHands,
        activeHandIndex,
        dealerCards,
        canSplit,
        gameState,
        isDeckShuffled,
        boardBusy,
    } = useGameContext();

    const { wager, evPercent, label } = describeAiBet(
        trueCount,
        playerChips,
        cardsRemaining,
        runningCount,
    );
    const spreadTc = getSpreadTrueCount(runningCount, cardsRemaining);
    const tableBet = playerHands?.length
        ? playerHands.reduce((sum, hand) => sum + (hand.bet ?? 0), 0)
        : currentBet || 0;
    const activeHand = playerHands?.[activeHandIndex] ?? null;
    const inPlayerPhase =
        gameState === GameState.PlayerPhase && activeHand?.status === 'playing';

    let playHint = null;
    if (inPlayerPhase && dealerCards?.[0] && activeHand?.cards?.length) {
        const splitAllowed =
            canSplit &&
            canSplitHand(activeHand, playerHands, playerChips, TABLE_RULES);
        const action = resolveAiPlayAction({
            playerCards: activeHand.cards,
            dealerUpcard: dealerCards[0],
            canSplit: splitAllowed,
            trueCount,
        });
        playHint = {
            action,
            playerTotal: calculateHandValue(activeHand.cards),
            handIndex: activeHandIndex + 1,
            handCount: playerHands.length,
        };
    }

    const goalPct = Math.min(100, Math.round((playerChips / COUNTER_GOAL_DOUBLE) * 100));
    const statusLabel = STATUS_COPY[aiPlayerStatus] ?? aiPlayerStatus;
    const tcTone = countValueClass(trueCount);
    const rcTone = countValueClass(runningCount);
    const evTone = evValueClass(evPercent);

    if (!aiPlayerEnabled) {
        return (
            <aside
                className="game-ai-glance"
                data-testid="ai-glance-panel"
                aria-label="AI watch panel"
            >
                <div className="rounded-xl border border-dashed border-cyan-400/25 bg-cyan-950/20 p-3">
                    <div className="font-mono text-[10px] font-bold tracking-wide text-cyan-300/80">
                        {AI_PLAYER_ID}
                    </div>
                    <p className="mt-2 text-xs leading-snug text-white/50">
                        AI glance stays here while you watch. Turn on {AI_PLAYER_NAME} in the
                        settings rail to stream bets, counts, and play decisions.
                    </p>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className="game-ai-glance"
            data-testid="ai-glance-panel"
            aria-label="AI play details"
        >
            <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto pb-2">
                <header className="shrink-0 rounded-xl border border-cyan-400/30 bg-gradient-to-b from-cyan-950/50 to-black/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="font-mono text-[10px] font-bold tracking-wide text-cyan-300">
                                {AI_PLAYER_ID}
                            </div>
                            <div className="mt-0.5 text-sm font-bold text-white">Live AI</div>
                        </div>
                        <span
                            className="rounded-md border border-cyan-400/40 bg-cyan-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-100"
                            data-testid="ai-glance-status"
                        >
                            {statusLabel}
                        </span>
                    </div>
                    {aiWatchMode && (
                        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-violet-300/90">
                            Watch pace on
                        </div>
                    )}
                    {aiPlayerLastAction && (
                        <p
                            className="mt-2 border-t border-white/10 pt-2 font-mono text-[11px] leading-snug text-cyan-100/95"
                            data-testid="ai-glance-last-action"
                        >
                            {aiPlayerLastAction}
                        </p>
                    )}
                    {boardBusy && (
                        <p className="mt-1 text-[10px] text-white/40">Board settling…</p>
                    )}
                </header>

                <div className="grid grid-cols-2 gap-1.5">
                    <StatCell label="Bankroll" testId="ai-glance-bankroll">
                        <span className="text-amber-300">${playerChips}</span>
                    </StatCell>
                    <StatCell label="Goal" testId="ai-glance-goal">
                        <span className="text-white/90">${COUNTER_GOAL_DOUBLE}</span>
                        <span className="ml-1 text-xs font-semibold text-white/45">{goalPct}%</span>
                    </StatCell>
                    <StatCell label="Table bet" testId="ai-glance-table-bet">
                        <span className="text-amber-200">
                            {tableBet > 0 ? `$${tableBet}` : '—'}
                        </span>
                    </StatCell>
                    <StatCell label="Next / sized" testId="ai-glance-next-bet">
                        <span className="text-amber-200">
                            {isDeckShuffled ? `$${wager}` : '—'}
                        </span>
                        {betAmount > 0 && betAmount !== wager && (
                            <span className="mt-0.5 block text-[10px] font-semibold text-white/40">
                                UI ${betAmount}
                            </span>
                        )}
                    </StatCell>
                </div>

                {isDeckShuffled && (
                    <>
                        <div className="grid grid-cols-2 gap-1.5">
                            <StatCell label="True count" testId="ai-glance-tc">
                                <span className={tcTone}>
                                    {trueCount > 0 ? `+${trueCount}` : trueCount}
                                </span>
                            </StatCell>
                            <StatCell label="Running" testId="ai-glance-rc">
                                <span className={rcTone}>
                                    {runningCount > 0 ? `+${runningCount}` : runningCount}
                                </span>
                            </StatCell>
                            <StatCell label="Spread TC" testId="ai-glance-spread-tc">
                                <span className={countValueClass(spreadTc)}>
                                    {spreadTc > 0 ? `+${spreadTc}` : spreadTc}
                                </span>
                            </StatCell>
                            <StatCell label="Est. EV" testId="ai-glance-ev">
                                <span className={evTone}>{formatEvPercent(evPercent)}</span>
                            </StatCell>
                        </div>

                        <div
                            className="rounded-lg border border-white/10 bg-black/40 px-2 py-2"
                            data-testid="ai-glance-bet-label"
                        >
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                                Bet rationale
                            </div>
                            <p className="mt-1 font-mono text-[11px] leading-snug text-amber-100/90">
                                {label}
                            </p>
                            <p className="mt-1 text-[10px] text-white/40">
                                {cardsRemaining} cards left in shoe
                            </p>
                        </div>
                    </>
                )}

                {playHint && (
                    <div
                        className="rounded-xl border border-emerald-400/30 bg-emerald-950/30 p-3"
                        data-testid="ai-glance-play"
                    >
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200/70">
                            Play decision
                            {playHint.handCount > 1
                                ? ` · hand ${playHint.handIndex}/${playHint.handCount}`
                                : ''}
                        </div>
                        <div className="mt-1 flex items-baseline justify-between gap-2">
                            <span
                                className="text-2xl font-black uppercase tracking-wide text-emerald-200"
                                data-testid="ai-glance-action"
                            >
                                {playHint.action}
                            </span>
                            <span className="text-xs tabular-nums text-white/55">
                                total {playHint.playerTotal}
                            </span>
                        </div>
                    </div>
                )}

                {!isDeckShuffled && (
                    <p className="text-xs text-cyan-200/60">
                        Shuffle the shoe — {AI_PLAYER_ID} will size bets from the count.
                    </p>
                )}
            </div>
        </aside>
    );
}

export default AiGlancePanel;
