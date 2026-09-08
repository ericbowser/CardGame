/** Yield so the browser can paint (overlay, input) before heavy work. */
import { debugLog } from '../e2e/debugLog';

export function yieldToMain() {
    if (typeof scheduler !== 'undefined' && typeof scheduler.postTask === 'function') {
        return scheduler.postTask(() => {}, { priority: 'user-visible' }).catch(
            () => new Promise((resolve) => setTimeout(resolve, 0)),
        );
    }

    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

/**
 * Wait for the next two animation frames so React can commit and paint.
 * Falls back after `timeoutMs` when RAF is throttled (Cypress headed, background tab).
 */
export function yieldToPaint(timeoutMs = 250) {
    const paintTimeout =
        typeof window !== 'undefined' &&
        (window.Cypress != null || import.meta.env.VITE_E2E === 'true')
            ? 50
            : timeoutMs;
    return new Promise((resolve) => {
        let settled = false;
        const finish = (via) => {
            if (!settled) {
                settled = true;
                if (via === 'timeout') {
                    // #region agent log
                    debugLog('yieldToMain.js:yieldToPaint', 'paint fallback timeout', { timeoutMs: paintTimeout }, 'H-E');
                    // #endregion
                }
                resolve();
            }
        };

        const timer = setTimeout(() => finish('timeout'), paintTimeout);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                clearTimeout(timer);
                finish('raf');
            });
        });
    });
}
