import { useEffect, useState } from 'react';

export function isPhoneViewport(canvasWidth = 0, canvasHeight = 0) {
    if (typeof window !== 'undefined') {
        if (window.matchMedia('(max-width: 900px)').matches) {
            return true;
        }
        if (Math.min(window.innerWidth, window.innerHeight) < 900) {
            return true;
        }
    }

    return canvasWidth > 0 && canvasWidth < 900;
}

/** Fit an overhead camera so the dealer-to-player play area fills the canvas. */
export function getOverheadCameraPose(canvasWidth, canvasHeight, layout, splitOffset) {
    const aspect = Math.max(canvasWidth, 1) / Math.max(canvasHeight, 1);
    const fov = aspect < 0.85 ? 50 : 42;
    const vFov = (fov * Math.PI) / 180;
    const playWidth = Math.max(4.8, splitOffset * 2 + 2.2);
    const playDepth = Math.abs(layout.playerZ - layout.dealerZ) + 2.2;
    const distForDepth = playDepth / 2 / Math.tan(vFov / 2);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const distForWidth = playWidth / 2 / Math.tan(hFov / 2);
    // < 1 zooms in (crops rail). Portrait is usually width-limited.
    const pad = aspect < 1 ? 0.78 : 0.88;
    const dist = Math.max(distForDepth, distForWidth) * pad;
    const lookZ = (layout.playerZ + layout.dealerZ) / 2;

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
