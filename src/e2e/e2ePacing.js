/** Read Cypress pacing env vars (set via CYPRESS_* in headed npm scripts). */
export function isAutomationHost() {
    return (
        typeof window !== 'undefined' &&
        (window.Cypress != null || import.meta.env.VITE_E2E === 'true')
    );
}

export function getCypressEnvNumber(key) {
    if (typeof window === 'undefined' || typeof window.Cypress?.env !== 'function') {
        return null;
    }

    const raw = window.Cypress.env(key);
    if (raw == null || raw === '') {
        return null;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
}

export function isCypressWatchPace() {
    const actionPause = getCypressEnvNumber('ACTION_PAUSE_MS');
    return actionPause != null && actionPause >= 500;
}

export function getCypressActionPauseMs(fallback = 50) {
    return getCypressEnvNumber('ACTION_PAUSE_MS') ?? fallback;
}

export function getCypressDealerStepMs(fallback = 1000) {
    const explicit = getCypressEnvNumber('DEALER_STEP_MS');
    if (explicit != null) {
        return explicit;
    }

    const actionPause = getCypressEnvNumber('ACTION_PAUSE_MS');
    if (actionPause != null) {
        return Math.max(fallback, actionPause);
    }

    return fallback;
}

export function getCypressCardDealStaggerMs(fallback = 110) {
    const explicit = getCypressEnvNumber('CARD_DEAL_STAGGER_MS');
    if (explicit != null) {
        return explicit;
    }

    return isCypressWatchPace() ? 150 : fallback;
}
