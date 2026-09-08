/** Text-only counter UI — no WebGL table (Cypress / debugging). */
export function isCounterTextMode() {
    if (import.meta.env.VITE_COUNTER_TEXT === 'true') {
        return true;
    }

    if (typeof window === 'undefined') {
        return false;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'text' || params.get('view') === 'text';
}
