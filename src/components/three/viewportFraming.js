import { useEffect, useState } from 'react';

/** Camera and playfield framing based on the 3D canvas size — not a second table GLB. */
export function getViewportFraming(width, height) {
    const aspect = width / Math.max(height, 1);
    const isMobile = width < 768;
    const isPortrait = aspect < 0.95;

    if (isPortrait) {
        return {
            isMobile: true,
            isPortrait: true,
            distance: 5.9,
            heightMul: 1.22,
            zMul: 0.22,
            fov: 48,
            minDistance: 4.2,
            maxDistance: 12,
            enableOrbit: false,
            splitOffset: 1.02,
        };
    }

    if (isMobile) {
        return {
            isMobile: true,
            isPortrait: false,
            distance: 7.4,
            heightMul: 0.9,
            zMul: 0.48,
            fov: 40,
            minDistance: 5.5,
            maxDistance: 16,
            enableOrbit: false,
            splitOffset: 1.18,
        };
    }

    return {
        isMobile: false,
        isPortrait: false,
        distance: aspect > 1.8 ? 9 : aspect > 1.2 ? 10 : 11,
        heightMul: 0.92,
        zMul: 0.62,
        fov: aspect > 1.5 ? 36 : 34,
        minDistance: 7.5,
        maxDistance: 20,
        enableOrbit: true,
        splitOffset: 1.35,
    };
}

export function useIsNarrowViewport() {
    const [narrow, setNarrow] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
    );

    useEffect(() => {
        const media = window.matchMedia('(max-width: 768px)');
        const onChange = () => setNarrow(media.matches);
        onChange();
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    return narrow;
}

