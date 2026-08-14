import { useTexture } from '@react-three/drei';
import facedown from '../assets/facedown4.jpg';

let preloadedSignature = '';

/** Warm drei texture cache so new cards do not suspend the 3D scene. */
export function preloadGameTextures(cardUrls = []) {
    if (!cardUrls.length) {
        return;
    }

    const signature = cardUrls.join('|');
    if (signature === preloadedSignature) {
        return;
    }

    preloadedSignature = signature;
    useTexture.preload([facedown, ...cardUrls]);
}
