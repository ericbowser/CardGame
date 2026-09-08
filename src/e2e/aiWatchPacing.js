/** Shared AI watch pacing flag (set by useAiPlayer while enabled + watch mode). */
let aiWatchPace = false;

export function setAiWatchPace(enabled) {
    aiWatchPace = Boolean(enabled);
}

export function isAiWatchPace() {
    return aiWatchPace;
}
