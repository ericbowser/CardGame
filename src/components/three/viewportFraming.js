import { useEffect, useState } from 'react';

function windowIsNarrow() {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.innerWidth < 1024;
}

/** True only for phone/tablet windows — not when side panels shrink the table canvas. */
export function isPhoneViewport(canvasWidth = 0, canvasHeight = 0) {
    if (windowIsNarrow()) {
        return true;
    }

    if (canvasWidth > 0 && canvasHeight > 0) {
        const tallCanvas = canvasHeight >= canvasWidth * 1.05;
        if (tallCanvas && windowIsNarrow()) {
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

    // Narrow center column on desktop (legacy 3-panel) — use overhead fit
    const isCompactDesktop = width < 780 && !windowIsNarrow();

    if (isCompactDesktop) {
        return {
            isMobile: false,
            isPortrait: aspect < 1,
            enableOrbit: false,
            distance: aspect < 0.75 ? 8 : 9.5,
            heightMul: 0.9,
            zMul: 0.55,
            fov: aspect < 0.7 ? 40 : 36,
            minDistance: 6,
            maxDistance: 14,
            splitOffset: 1.15,
            useOverheadDesktop: true,
        };
    }

    const distance = aspect > 1.8 ? 12 : aspect > 1.2 ? 13.5 : 14.5;

    return {
        isMobile: false,
        isPortrait: false,
        enableOrbit: true,
        distance,
        heightMul: 0.95,
        zMul: 0.68,
        fov: aspect > 1.5 ? 42 : 40,
        minDistance: 9,
        maxDistance: 24,
        splitOffset,
        useOverheadDesktop: false,
    };
}

export function useIsNarrowViewport() {
    const [narrow, setNarrow] = useState(() => windowIsNarrow());

    useEffect(() => {
        const onChange = () => {
            setNarrow(windowIsNarrow());
        };
        onChange();
        window.addEventListener('resize', onChange);
        return () => window.removeEventListener('resize', onChange);
    }, []);

    return narrow;
}
