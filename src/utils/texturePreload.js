import { useTexture } from '@react-three/drei';
import facedown from '../assets/facedown4.jpg';

let preloadedSignature = '';
let preloadQueued = false;

function scheduleIdle(callback) {
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(callback, { timeout: 180 });
        return;
    }
    setTimeout(callback, 16);
}

/** Warm drei's texture cache in idle chunks so decode does not freeze the table. */
export function preloadGameTextures(cardUrls = []) {
    if (!cardUrls.length) {
        return;
    }

    const signature = cardUrls.join('|');
    if (signature === preloadedSignature && preloadQueued) {
        return;
    }

    preloadedSignature = signature;
    preloadQueued = true;

    const urls = [facedown, ...cardUrls];
    const chunkSize = 6;
    let index = 0;

    const loadChunk = () => {
        useTexture.preload(urls.slice(index, index + chunkSize));
        index += chunkSize;
        if (index < urls.length) {
            scheduleIdle(loadChunk);
        }
    };

    useTexture.preload([facedown]);
    scheduleIdle(loadChunk);
}
