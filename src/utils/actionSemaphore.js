/**
 * Binary semaphore for serializing AI (or other automation) turns.
 * Only one holder at a time; release must use the same token.
 */
export function createActionSemaphore() {
    let locked = false;
    let token = 0;

    return {
        isLocked: () => locked,

        /** @returns {number|null} token if acquired, null if already held */
        tryAcquire() {
            if (locked) {
                return null;
            }
            locked = true;
            token += 1;
            return token;
        },

        /**
         * Release only if `heldToken` matches the current lock.
         * @returns {boolean} whether release succeeded
         */
        release(heldToken) {
            if (!locked || heldToken !== token) {
                return false;
            }
            locked = false;
            return true;
        },

        /** Drop the lock unconditionally (disable / reset). */
        forceRelease() {
            locked = false;
            token += 1;
        },
    };
}

/**
 * Watch-mode pacing: snappier than the first pass, still slow enough to read.
 * Non-watch stays quick for unattended / Cypress automation.
 */

/** Card fly-in + React commit settle after a board action. */
export function getAiSettleMs(watchMode) {
    return watchMode ? 1600 : 450;
}

/** Pause before betting / hitting — human “thinking” time. */
export function getAiActionDelayMs(watchMode, override) {
    if (override != null && Number.isFinite(override)) {
        return override;
    }
    return watchMode ? 2000 : 600;
}

/** Hold on the finished table before the next wager. */
export function getAiBetweenHandsMs(watchMode) {
    return watchMode ? 2600 : 500;
}

/** Extra time after cards are dealt so fly-ins are fully visible. */
export function getAiDealWatchMs(watchMode) {
    return watchMode ? 1800 : 550;
}

/** Hold after the dealer hole card flips face-up before rushing hits / settle. */
export function getAiDealerRevealMs(watchMode) {
    return watchMode ? 2000 : 550;
}
