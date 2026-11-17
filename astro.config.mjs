// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Same stack as getassist.pro: static Astro, Tailwind v4, self-hosted fonts,
// sitemap-index.xml. Client-side JavaScript only in public/js (pricing calculators, Google Tag Manager),
// because the CSP allows no inline script. Served from Cloudflare.
export default defineConfig({
  site: 'https://chithii.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // The CSP only allows stylesheets from 'self', so never inline CSS.
    inlineStylesheets: 'never',
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { plugins: [tailwindcss()] },
});
