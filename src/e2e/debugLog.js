/** Debug session 5f4987 — headed Cypress stability */
export function debugLog(location, message, data = {}, hypothesisId = '') {
    // #region agent log
    fetch('http://127.0.0.1:7477/ingest/34464f81-ff91-4f6f-b783-65cda7670616', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '5f4987' },
        body: JSON.stringify({
            sessionId: '5f4987',
            location,
            message,
            data,
            hypothesisId,
            timestamp: Date.now(),
        }),
    }).catch(() => {});
    // #endregion
}

export function attachDebugLog() {
    if (typeof window !== 'undefined') {
        window.__DEBUG_LOG__ = debugLog;
    }
}
