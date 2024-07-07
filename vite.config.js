import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
    plugins: [
        react(),
        commonjs(),
        nodePolyfills(),
        {
            ...image(),
            enforce: 'post',
        },
    ],
    assetsInclude: ['**/*.docx', '**/src/assets/images/*.{png}', '**/src/assets/*.{png|jpg}','**/src/assets/*.{js}']
})
