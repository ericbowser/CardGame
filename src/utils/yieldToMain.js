/** Yield so the browser can paint (overlay, input) before heavy work. */
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

/** Wait for the next two animation frames so React can commit and paint. */
export function yieldToPaint() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}
