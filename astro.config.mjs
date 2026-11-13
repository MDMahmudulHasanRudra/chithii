// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Same stack as getassist.pro: static Astro, Tailwind v4, self-hosted fonts,
// zero client-side JavaScript, sitemap-index.xml. Served from Cloudflare.
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
