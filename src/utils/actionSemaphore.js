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

/** Card fly-in + React commit settle after a board action. */
export function getAiSettleMs(watchMode) {
    return watchMode ? 900 : 450;
}
