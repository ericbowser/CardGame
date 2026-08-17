import { useEffect, useState } from 'react';

/** Galaxy S20-class phones are ~9:20. Any tall canvas must use the overhead crop. */
export function isPhoneViewport(canvasWidth = 0, canvasHeight = 0) {
    if (canvasWidth > 0 && canvasHeight > 0) {
        if (canvasHeight >= canvasWidth * 0.92) {
            return true;
        }
        if (canvasWidth < 900) {
            return true;
        }
    }

    if (typeof window !== 'undefined') {
        if (window.matchMedia('(max-width: 900px)').matches) {
            return true;
        }
        if (Math.min(window.innerWidth, window.innerHeight) < 900) {
            return true;
        }
    }

    return false;
}

/**
 * Overhead camera using object-fit:cover.
 * Tall phones (S20 9:20) used to fit WIDTH, which left a black band under the table.
 */
export function getOverheadCameraPose(canvasWidth, canvasHeight, layout, splitOffset) {
    const aspect = Math.max(canvasWidth, 1) / Math.max(canvasHeight, 1);
    const fov = aspect < 0.7 ? 54 : aspect < 0.9 ? 48 : 42;
    const vFov = (fov * Math.PI) / 180;
    const playWidth = Math.max(5.0, splitOffset * 2 + 2.4);
    const playDepth = Math.abs(layout.playerZ - layout.dealerZ) + 2.8;
    const distForDepth = playDepth / 2 / Math.tan(vFov / 2);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const distForWidth = playWidth / 2 / Math.tan(hFov / 2);
    // Cover the canvas (crop rails) instead of containing the playfield (black bars).
    const dist = Math.min(distForDepth, distForWidth) * 0.9;
    const lookZ = layout.dealerZ * 0.4 + layout.playerZ * 0.6;

    return {
        fov,
        dist,
        lookZ,
        position: [0, layout.topY + dist, lookZ],
        target: [0, layout.topY, lookZ],
    };
}

export function getViewportFraming(width, height) {
    const aspect = width / Math.max(height, 1);
    const isMobile = isPhoneViewport(width, height);
    const isPortrait = aspect < 1.05;
    const splitOffset = isMobile ? (isPortrait ? 0.95 : 1.1) : 1.35;

    if (isMobile) {
        return {
            isMobile: true,
            isPortrait,
            enableOrbit: false,
            splitOffset,
        };
    }

    const distance = aspect > 1.8 ? 9 : aspect > 1.2 ? 10 : 11;

    return {
        isMobile: false,
        isPortrait: false,
        enableOrbit: true,
        distance,
        heightMul: 0.92,
        zMul: 0.62,
        fov: aspect > 1.5 ? 36 : 34,
        minDistance: 7.5,
        maxDistance: 20,
        splitOffset,
    };
}

export function useIsNarrowViewport() {
    const [narrow, setNarrow] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        return isPhoneViewport(window.innerWidth, window.innerHeight);
    });

    useEffect(() => {
        const onChange = () => {
            setNarrow(isPhoneViewport(window.innerWidth, window.innerHeight));
        };
        onChange();
        window.addEventListener('resize', onChange);
        return () => window.removeEventListener('resize', onChange);
    }, []);

    return narrow;
}
