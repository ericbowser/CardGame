import { useEffect, useRef, useState } from 'react';
import { AI_PLAYER_ID } from '../constants/aiPlayer';
import { GameState } from '../constants/game';
import { TABLE_RULES } from '../constants/rules';
import { describeAiBet, resolveAiPlayAction } from '../utils/counterBetSpread';
import { canSplitHand } from '../utils/handUtils';
import { createActionSemaphore, getAiSettleMs } from '../utils/actionSemaphore';

const AI_DELAY_FAST_MS = 750;
const AI_DELAY_WATCH_MS = 1800;
const BUSY_GRACE_MS = 120;

/**
 * AI driver with a turn semaphore so the next bet/hit waits until:
 * 1) the previous action has been dispatched,
 * 2) boardBusy has cleared (or a short grace if busy never flipped),
 * 3) a settle window so cards can render before the next move.
 */
export function useAiPlayer({
    enabled,
    watchMode,
    actionDelayMs,
    gameState,
    boardBusy,
    roundOver,
    isDeckShuffled,
    playerChips,
    trueCount,
    cardsRemaining,
    playerHands,
    activeHandIndex,
    dealerCards,
    canSplit,
    setBetAmount,
    placeBetAndDeal,
    shuffleDeck,
    playerHit,
    playerStay,
    playerSplit,
    setAiPlayerStatus,
    setAiPlayerLastAction,
    addLog,
    runningCount,
}) {
    const semaphoreRef = useRef(createActionSemaphore());
    const phaseRef = useRef('idle');
    const tokenRef = useRef(null);
    const timerRef = useRef(null);
    const betPhaseKeyRef = useRef(null);
    const playPhaseKeyRef = useRef(null);
    const prevGameStateRef = useRef(null);
    const sawBusyRef = useRef(false);
    const [gateTick, setGateTick] = useState(0);

    const clearTimer = () => {
        if (timerRef.current != null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const releaseGate = () => {
        const token = tokenRef.current;
        if (token != null) {
            semaphoreRef.current.release(token);
        }
        tokenRef.current = null;
        phaseRef.current = 'idle';
        sawBusyRef.current = false;
        clearTimer();
        setGateTick((n) => n + 1);
    };

    const forceResetGate = () => {
        clearTimer();
        semaphoreRef.current.forceRelease();
        tokenRef.current = null;
        phaseRef.current = 'idle';
        sawBusyRef.current = false;
    };

    useEffect(() => {
        if (!enabled) {
            forceResetGate();
            setAiPlayerStatus('off');
            betPhaseKeyRef.current = null;
            playPhaseKeyRef.current = null;
            prevGameStateRef.current = null;
            return undefined;
        }

        if (prevGameStateRef.current !== gameState) {
            if (gameState === GameState.GameConcluded) {
                betPhaseKeyRef.current = null;
            }
            if (gameState === GameState.PlayerPhase || gameState === GameState.CardsDealt) {
                playPhaseKeyRef.current = null;
            }
            prevGameStateRef.current = gameState;
        }

        const delayMs = actionDelayMs ?? (watchMode ? AI_DELAY_WATCH_MS : AI_DELAY_FAST_MS);
        const settleMs = getAiSettleMs(watchMode);

        // --- Semaphore held: wait for idle board + settle paint ---
        if (phaseRef.current === 'inFlight') {
            if (boardBusy) {
                sawBusyRef.current = true;
                clearTimer();
                return undefined;
            }

            clearTimer();
            const waitMs = sawBusyRef.current ? settleMs : BUSY_GRACE_MS + settleMs;
            timerRef.current = window.setTimeout(() => {
                if (phaseRef.current !== 'inFlight') {
                    return;
                }
                releaseGate();
            }, waitMs);

            return () => clearTimer();
        }

        if (phaseRef.current === 'scheduled') {
            return undefined;
        }

        if (boardBusy || semaphoreRef.current.isLocked()) {
            return undefined;
        }

        if (gameState === GameState.DealerPhase) {
            setAiPlayerStatus('watching');
            return undefined;
        }

        const activeHand = playerHands[activeHandIndex] ?? null;
        const bettingReady =
            isDeckShuffled &&
            playerChips >= 5 &&
            (gameState === null || gameState === GameState.GameConcluded);

        const acquire = () => {
            const token = semaphoreRef.current.tryAcquire();
            if (token == null) {
                return false;
            }
            tokenRef.current = token;
            phaseRef.current = 'scheduled';
            return true;
        };

        const markInFlight = () => {
            phaseRef.current = 'inFlight';
            sawBusyRef.current = false;
            timerRef.current = null;
            // Nudge effect so inFlight waiter attaches even if busy is already false.
            setGateTick((n) => n + 1);
        };

        if (bettingReady) {
            const phaseKey = `${gameState ?? 'ready'}-${roundOver}-${playerChips}`;
            if (betPhaseKeyRef.current === phaseKey) {
                return undefined;
            }

            const { wager, label } = describeAiBet(
                trueCount,
                playerChips,
                cardsRemaining,
                runningCount,
            );

            if (!acquire()) {
                return undefined;
            }

            if (wager <= 0) {
                setAiPlayerStatus('wonging');
                setAiPlayerLastAction(`${AI_PLAYER_ID} → ${label}`);
                addLog(`${AI_PLAYER_ID} ${label} — reshuffling shoe.`);

                timerRef.current = window.setTimeout(() => {
                    markInFlight();
                    shuffleDeck();
                    betPhaseKeyRef.current = null;
                }, delayMs);

                return () => {
                    if (phaseRef.current === 'scheduled') {
                        clearTimer();
                        releaseGate();
                    }
                };
            }

            playPhaseKeyRef.current = null;
            setAiPlayerStatus('betting');
            setAiPlayerLastAction(`${AI_PLAYER_ID} → ${label}`);
            setBetAmount(wager);
            addLog(`${AI_PLAYER_ID} bets ${label}`);

            timerRef.current = window.setTimeout(() => {
                markInFlight();
                placeBetAndDeal(wager);
                betPhaseKeyRef.current = phaseKey;
            }, delayMs);

            return () => {
                if (phaseRef.current === 'scheduled') {
                    clearTimer();
                    releaseGate();
                }
            };
        }

        if (gameState === GameState.PlayerPhase && activeHand?.status === 'playing') {
            const playKey = `${activeHandIndex}-${activeHand.cards.length}-${activeHand.status}`;
            if (playPhaseKeyRef.current === playKey) {
                return undefined;
            }

            const splitAllowed =
                canSplit &&
                canSplitHand(activeHand, playerHands, playerChips, TABLE_RULES);

            const action = resolveAiPlayAction({
                playerCards: activeHand.cards,
                dealerUpcard: dealerCards[0],
                canSplit: splitAllowed,
                trueCount,
            });

            if (!acquire()) {
                return undefined;
            }

            setAiPlayerStatus('playing');
            setAiPlayerLastAction(
                `${AI_PLAYER_ID} → ${action.toUpperCase()} (hand ${activeHandIndex + 1})`,
            );
            addLog(`${AI_PLAYER_ID} ${action}s hand ${activeHandIndex + 1}.`);

            timerRef.current = window.setTimeout(() => {
                markInFlight();
                if (action === 'hit') {
                    playerHit();
                } else if (action === 'stand') {
                    playerStay();
                } else if (action === 'split') {
                    playerSplit();
                }
                playPhaseKeyRef.current = playKey;
            }, delayMs);

            return () => {
                if (phaseRef.current === 'scheduled') {
                    clearTimer();
                    releaseGate();
                }
            };
        }

        if (isDeckShuffled && gameState !== GameState.PlayerPhase) {
            setAiPlayerStatus('ready');
        }

        return undefined;
        // gateTick intentionally included so release/inFlight transitions re-run the loop.
    }, [
        enabled,
        watchMode,
        actionDelayMs,
        gameState,
        boardBusy,
        roundOver,
        isDeckShuffled,
        playerChips,
        trueCount,
        runningCount,
        cardsRemaining,
        playerHands,
        activeHandIndex,
        dealerCards,
        canSplit,
        setBetAmount,
        placeBetAndDeal,
        shuffleDeck,
        playerHit,
        playerStay,
        playerSplit,
        setAiPlayerStatus,
        setAiPlayerLastAction,
        addLog,
        gateTick,
    ]);
}
