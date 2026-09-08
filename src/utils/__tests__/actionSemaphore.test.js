import { createActionSemaphore, getAiSettleMs } from '../actionSemaphore';

describe('actionSemaphore', () => {
    test('only one holder can acquire at a time', () => {
        const sem = createActionSemaphore();
        const a = sem.tryAcquire();
        const b = sem.tryAcquire();

        expect(a).toEqual(expect.any(Number));
        expect(b).toBeNull();
        expect(sem.isLocked()).toBe(true);

        expect(sem.release(a)).toBe(true);
        expect(sem.isLocked()).toBe(false);

        const c = sem.tryAcquire();
        expect(c).toEqual(expect.any(Number));
        expect(c).not.toBe(a);
    });

    test('stale token cannot release a newer lock', () => {
        const sem = createActionSemaphore();
        const a = sem.tryAcquire();
        sem.forceRelease();
        const b = sem.tryAcquire();

        expect(sem.release(a)).toBe(false);
        expect(sem.isLocked()).toBe(true);
        expect(sem.release(b)).toBe(true);
    });

    test('settle ms is longer in watch mode', () => {
        expect(getAiSettleMs(true)).toBeGreaterThan(getAiSettleMs(false));
    });
});
