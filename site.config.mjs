/** Canonical site origin for sitemap / robots (no trailing slash). */
export const SITE_URL = process.env.SITE_URL || 'https://erb-think.com';

export const SITE_NAME = 'Blackjack Card Counter';

export const SITE_PAGES = [
    {
        path: '/',
        changefreq: 'weekly',
        priority: '1.0',
    },
];
