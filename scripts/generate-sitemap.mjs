import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_PAGES, SITE_URL } from '../site.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const today = new Date().toISOString().slice(0, 10);

mkdirSync(publicDir, { recursive: true });

const urls = SITE_PAGES.map((page) => {
    const loc = page.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8');

console.log(`Wrote public/sitemap.xml and public/robots.txt for ${SITE_URL}`);
