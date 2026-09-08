import { defineConfig } from 'cypress';

const baseUrl = process.env.CYPRESS_BASE_URL || 'http://127.0.0.1:5199';

export default defineConfig({
    e2e: {
        baseUrl,
        // Headed + WebGL + screen capture often crashes Chrome on Windows
        video: process.env.CYPRESS_DISABLE_VIDEO !== 'true',
        videoCompression: 32,
        viewportWidth: 1920,
        viewportHeight: 1080,
        defaultCommandTimeout: 45000,
        requestTimeout: 15000,
        numTestsKeptInMemory: 0,
        env: {
            ACTION_PAUSE_MS: 50,
            DEALER_STEP_MS: 1000,
            CARD_DEAL_STAGGER_MS: 110,
        },
        setupNodeEvents(on, config) {
            on('task', {
                log(message) {
                    // eslint-disable-next-line no-console
                    console.log(message);
                    return null;
                },
            });

            on('before:browser:launch', (browser, launchOptions) => {
                if (browser.name === 'chrome' || browser.family === 'chromium') {
                    launchOptions.args.push('--disable-background-timer-throttling');
                    launchOptions.args.push('--disable-backgrounding-occluded-windows');
                    launchOptions.args.push('--disable-renderer-backgrounding');
                    launchOptions.args.push('--disable-dev-shm-usage');
                    launchOptions.args.push('--disable-gpu-sandbox');
                    launchOptions.args.push('--js-flags=--max-old-space-size=4096');
                    if (process.env.CYPRESS_DISABLE_GPU === 'true') {
                        launchOptions.args.push('--disable-gpu');
                    }
                }
                return launchOptions;
            });

            return config;
        },
    },
});
