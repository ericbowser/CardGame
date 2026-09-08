import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const isGitHubPages = process.env.DEPLOY_TARGET === 'gh-pages';
const isE2eDev = process.env.VITE_E2E === 'true';

export default defineConfig({
    base: isGitHubPages ? '/CardGame/' : '/',
    plugins: [
        react(),
        commonjs(),
        nodePolyfills(),
        {
            ...image(),
            enforce: 'post',
        },
    ],
    server: {
        port: 5173,
        strictPort: true,
        // Prevent mid-test full page reloads during headed Cypress runs
        hmr: isE2eDev ? false : undefined,
        watch: isE2eDev ? { ignored: ['**/*'] } : undefined,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        assetsInlineLimit: 4096,
    },
    assetsInclude: [
        '**/*.docx',
        '**/*.glb',
        '**/src/assets/images/*.{png}',
        '**/src/assets/*.{png|jpg}',
        '**/src/assets/*.{js}',
    ],
});
