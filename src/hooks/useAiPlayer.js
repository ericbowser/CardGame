import { useEffect, useRef } from 'react';
import { AI_PLAYER_ID } from '../constants/aiPlayer';
import { GameState } from '../constants/game';
import { TABLE_RULES } from '../constants/rules';
import { setAiWatchPace } from '../e2e/aiWatchPacing';
import { describeAiBet, resolveAiPlayAction } from '../utils/counterBetSpread';
import { canSplitHand } from '../utils/handUtils';
import {
    getAiActionDelayMs,
    getAiBetweenHandsMs,
    getAiDealWatchMs,
    getAiSettleMs,
} from '../utils/actionSemaphore';

const POLL_MS = 50;
const BUSY_WAIT_MS = 30000;
const DEAL_WAIT_MS = 30000;

function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
        }
        const timer = window.setTimeout(resolve, ms);
        const onAbort = () => {
            window.clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        };
        signal?.addEventListener('abort', onAbort, { once: true });
    });
}

function yieldToPaint(signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
        }
        const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
        signal?.addEventListener('abort', onAbort, { once: true });
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                signal?.removeEventListener('abort', onAbort);
                resolve();
            });
        });
    });
}

/**
 * Human-paced AI: every step waits for the table to update, then holds so you
 * can watch before the next move.
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
    dealEpoch = 0,
}) {
    const snapRef = useRef({});
    snapRef.current = {
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
        runningCount,
        dealEpoch,
        setBetAmount,
        placeBetAndDeal,
        shuffleDeck,
        playerHit,
        playerStay,
        playerSplit,
        setAiPlayerStatus,
        setAiPlayerLastAction,
        addLog,
    };

    useEffect(() => {
        if (!enabled) {
            setAiWatchPace(false);
            if (typeof window !== 'undefined') {
                window.__AI_WATCH_PACE__ = false;
            }
            snapRef.current.setAiPlayerStatus?.('off');
            return undefined;
        }

        const watch = Boolean(snapRef.current.watchMode);
        setAiWatchPace(watch);
        if (typeof window !== 'undefined') {
            window.__AI_WATCH_PACE__ = watch;
        }

        const controller = new AbortController();
        const { signal } = controller;
        let lastWatchedEpoch = -1;

        const waitWhile = async (predicate, timeoutMs) => {
            const started = Date.now();
            while (!signal.aborted && predicate()) {
                if (Date.now() - started > timeoutMs) {
                    return false;
                }
                await sleep(POLL_MS, signal);
            }
            return !signal.aborted;
        };

        const waitUntilIdle = async () => {
            await waitWhile(() => snapRef.current.boardBusy, BUSY_WAIT_MS);
        };

        const waitForUiReady = async () => {
            await waitUntilIdle();
            await yieldToPaint(signal);
            await sleep(getAiSettleMs(snapRef.current.watchMode), signal);
        };

        const handsAreDealt = () => {
            const s = snapRef.current;
            const playerCards = s.playerHands?.[0]?.cards?.length ?? 0;
            const dealerCardsCount = s.dealerCards?.length ?? 0;
            return playerCards >= 2 && dealerCardsCount >= 2 && !s.boardBusy;
        };

        /** Watch the finished hand (scores, hole card, result) before betting again. */
        const watchFinishedHand = async () => {
            const s = snapRef.current;
            if (s.gameState !== GameState.GameConcluded) {
                return;
            }
            if (s.dealEpoch === lastWatchedEpoch) {
                return;
            }

            lastWatchedEpoch = s.dealEpoch;
            s.setAiPlayerStatus('between-rounds');
            s.setAiPlayerLastAction(`${AI_PLAYER_ID} watching result…`);
            await waitUntilIdle();
            await yieldToPaint(signal);
            await sleep(getAiBetweenHandsMs(s.watchMode), signal);
        };

        const waitForDeal = async (epochBefore) => {
            await waitWhile(
                () => snapRef.current.dealEpoch === epochBefore,
                DEAL_WAIT_MS,
            );
            await waitUntilIdle();
            await waitWhile(() => !handsAreDealt(), DEAL_WAIT_MS);
            await yieldToPaint(signal);
            await sleep(getAiDealWatchMs(snapRef.current.watchMode), signal);
        };

        const actionDelay = () =>
            getAiActionDelayMs(snapRef.current.watchMode, snapRef.current.actionDelayMs);

        const run = async () => {
            try {
                await waitForUiReady();

                while (!signal.aborted) {
                    const snap = snapRef.current;

                    if (!snap.isDeckShuffled || snap.playerChips < 5) {
                        snap.setAiPlayerStatus(snap.isDeckShuffled ? 'ready' : 'off');
                        await sleep(POLL_MS * 4, signal);
                        continue;
                    }

                    await waitUntilIdle();
                    if (signal.aborted) {
                        break;
                    }

                    const live = snapRef.current;

                    // --- Dealer: wait through every hit, then hold on the result ---
                    if (live.gameState === GameState.DealerPhase) {
                        live.setAiPlayerStatus('watching');
                        await waitWhile(
                            () => snapRef.current.gameState === GameState.DealerPhase,
                            BUSY_WAIT_MS,
                        );
                        await waitForUiReady();
                        await watchFinishedHand();
                        continue;
                    }

                    // --- Player action ---
                    const activeHand = live.playerHands[live.activeHandIndex] ?? null;
                    if (
                        live.gameState === GameState.PlayerPhase &&
                        activeHand?.status === 'playing'
                    ) {
                        if (!handsAreDealt()) {
                            await waitWhile(() => !handsAreDealt(), DEAL_WAIT_MS);
                            await sleep(getAiDealWatchMs(snapRef.current.watchMode), signal);
                            continue;
                        }

                        const splitAllowed =
                            live.canSplit &&
                            canSplitHand(
                                activeHand,
                                live.playerHands,
                                live.playerChips,
                                TABLE_RULES,
                            );
                        const action = resolveAiPlayAction({
                            playerCards: activeHand.cards,
                            dealerUpcard: live.dealerCards[0],
                            canSplit: splitAllowed,
                            trueCount: live.trueCount,
                        });

                        live.setAiPlayerStatus('playing');
                        live.setAiPlayerLastAction(
                            `${AI_PLAYER_ID} → ${action.toUpperCase()} (hand ${live.activeHandIndex + 1})`,
                        );
                        live.addLog(
                            `${AI_PLAYER_ID} ${action}s hand ${live.activeHandIndex + 1}.`,
                        );

                        // Think before clicking.
                        await sleep(actionDelay(), signal);
                        if (signal.aborted) {
                            break;
                        }

                        const cardsBefore = activeHand.cards.length;
                        const handsBefore = live.playerHands.length;
                        const act = snapRef.current;

                        if (action === 'hit') {
                            act.playerHit();
                            await waitWhile(() => {
                                const hand =
                                    snapRef.current.playerHands[snapRef.current.activeHandIndex];
                                return (
                                    (hand?.cards?.length ?? 0) <= cardsBefore &&
                                    snapRef.current.gameState === GameState.PlayerPhase
                                );
                            }, DEAL_WAIT_MS);
                            await waitForUiReady();
                        } else if (action === 'stand') {
                            act.playerStay();
                            await waitForUiReady();
                        } else if (action === 'split') {
                            act.playerSplit();
                            await waitWhile(() => {
                                return (
                                    snapRef.current.playerHands.length <= handsBefore &&
                                    snapRef.current.boardBusy
                                );
                            }, DEAL_WAIT_MS);
                            await waitUntilIdle();
                            await sleep(getAiDealWatchMs(snapRef.current.watchMode), signal);
                        }

                        // Instant BJ / all-bust may skip dealer — still watch the result.
                        if (snapRef.current.gameState === GameState.GameConcluded) {
                            await watchFinishedHand();
                        }
                        continue;
                    }

                    // --- Between hands: watch result, then bet & deal ---
                    const bettingReady =
                        live.gameState === null || live.gameState === GameState.GameConcluded;

                    if (bettingReady) {
                        if (live.gameState === GameState.GameConcluded) {
                            await watchFinishedHand();
                        } else {
                            await waitForUiReady();
                        }

                        const latest = snapRef.current;
                        if (
                            latest.gameState !== null &&
                            latest.gameState !== GameState.GameConcluded
                        ) {
                            continue;
                        }

                        const { wager, label } = describeAiBet(
                            latest.trueCount,
                            latest.playerChips,
                            latest.cardsRemaining,
                            latest.runningCount,
                        );

                        if (wager <= 0) {
                            latest.setAiPlayerStatus('wonging');
                            latest.setAiPlayerLastAction(`${AI_PLAYER_ID} → ${label}`);
                            latest.addLog(`${AI_PLAYER_ID} ${label} — reshuffling shoe.`);
                            await sleep(actionDelay(), signal);
                            snapRef.current.shuffleDeck();
                            await waitForUiReady();
                            continue;
                        }

                        const epochBefore = latest.dealEpoch;
                        latest.setAiPlayerStatus('betting');
                        latest.setAiPlayerLastAction(`${AI_PLAYER_ID} → ${label}`);
                        latest.setBetAmount(wager);
                        latest.addLog(`${AI_PLAYER_ID} bets ${label}`);

                        // Show the bet in the UI, then pause like a human placing chips.
                        await yieldToPaint(signal);
                        await sleep(actionDelay(), signal);
                        if (signal.aborted) {
                            break;
                        }

                        const beforeDeal = snapRef.current;
                        if (
                            beforeDeal.gameState !== null &&
                            beforeDeal.gameState !== GameState.GameConcluded
                        ) {
                            continue;
                        }

                        beforeDeal.placeBetAndDeal(wager);
                        await waitForDeal(epochBefore);

                        // Natural BJ / push resolved on the deal — watch before looping.
                        if (snapRef.current.gameState === GameState.GameConcluded) {
                            await watchFinishedHand();
                        }
                        continue;
                    }

                    live.setAiPlayerStatus('ready');
                    await sleep(POLL_MS * 2, signal);
                }
            } catch (error) {
                if (error?.name !== 'AbortError') {
                    console.error('[useAiPlayer]', error);
                }
            }
        };

        snapRef.current.setAiPlayerStatus('ready');
        run();

        return () => {
            controller.abort();
            setAiWatchPace(false);
            if (typeof window !== 'undefined') {
                window.__AI_WATCH_PACE__ = false;
            }
            snapRef.current.setAiPlayerStatus?.('off');
        };
    }, [enabled, watchMode]);
}
