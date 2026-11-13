# getassist.pro → chithii.com migration

Rebrand **Get Assist → Chithii** and move the marketing site to **chithii.com** and the app to **app.chithii.com**.
Prepared 13 November 2026.

## 1. What was collected from getassist.pro

Everything is saved in [`migration-source/`](migration-source/):

| Item | Where |
| --- | --- |
| Text of all 12 pages | `migration-source/pages/*.md` |
| Original HTML of all 12 pages | `migration-source/html/*.html` |
| Old logo, favicon, icons, OG image | `migration-source/brand-assets/` |
| Live security headers | `migration-source/live-response-headers.txt` |
| The app's full module registry (37 modules) | `migration-source/app-feature-registry.tsv` |

**Company facts:** founders MD Mahmudul Hasan Rudra and Sifat A Rabbi, Dhaka, Bangladesh.
**Emails:** contact@, support@, privacy@ (moved from getassist.pro to chithii.com).
**Policies:** Privacy, Terms, Data deletion, Cookies, Security, Subprocessors, AI transparency. All dated effective 27 October 2026.

### Old stack (detected) = new stack (rebuilt)

| Layer | getassist.pro | chithii.com |
| --- | --- | --- |
| Framework | Astro, static output, `@astrojs/sitemap` (`sitemap-index.xml`) | Astro 7, static, same sitemap |
| CSS | Tailwind CSS v4 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Fonts | Figtree, self-hosted | Inter + Noto Sans Bengali, self-hosted (Inter matches the Chithii app) |
| JavaScript | none | none (menus and FAQ use `<details>`) |
| Hosting/DNS | Cloudflare | Cloudflare (Workers static assets or Pages) |
| Security | strict CSP, no cookies, no analytics | same CSP in `public/_headers`, plus HSTS |
| App | Next.js behind Caddy, Hostinger VPS (Kuala Lumpur) | unchanged, new hostname |

## 2. What changed in content

- **Features:** the old site marked all 8 features "Coming soon". The new site lists 47+ capabilities in 7 areas, all **Available**, written from the app's own module registry: omnichannel inbox, AI and automation, team and SLA operations, 23 reports, customers and commerce, Social Studio, platform and API.
- **Messenger/Instagram:** "Pending Meta approval" became **Live**. URLs kept the same (`/integrations/facebook`, `/integrations/instagram`), so links already given to Meta reviewers keep working.
- **New pages:** `/integrations` (all integrations), `/integrations/whatsapp`, `/about` (founders, the name চিঠি), `/404`.
- **Not on the public site, on purpose:** WhatsApp (Legacy, QR-linked), Broadcast, Add Number to Groups, Groups Admin Maker. They stay in the app.
- **Legal pages:** rebranded, emails moved, and extended to cover WhatsApp, Telegram, website chat, clients/orders, payment links, couriers, Shopify/WooCommerce/Google Sheets, Copilot, mood detection and Social Studio. "Last updated" is 13 November 2026. Each policy now notes it replaces the Get Assist version.

## 3. Check before going live (needs you)

1. **Meta permissions.** The Facebook, Instagram and WhatsApp pages list `public_profile`, `pages_show_list`, `pages_manage_metadata`, `pages_messaging`, `instagram_basic`, `instagram_manage_messages`, `whatsapp_business_management` and `whatsapp_business_messaging`. Make the tables match exactly what your Meta app requests. **Social Studio publishes posts**, so if it uses `pages_manage_posts`, `pages_read_engagement` or `instagram_content_publish`, add those rows.
2. **WhatsApp connect steps** in `/integrations/whatsapp` are written for Meta Embedded Signup. Adjust them if your flow is different.
3. **Subprocessors.** Only Hostinger and Cloudflare are listed, as before. If the app sends email (it has `/settings/email`) through a provider, or uses any other service that touches personal data, add it.
4. **Legal review.** The legal text was extended to match the product. Have someone you trust review it.
5. **Email.** Create contact@, support@, privacy@chithii.com, and forward the old @getassist.pro addresses (the Contact page says they forward).

## 4. Go-live steps

1. **DNS:** add chithii.com to Cloudflare. Point `app.chithii.com` (A record) at the Hostinger VPS, and add the host to the Caddyfile so Caddy issues its certificate.
2. **Deploy the site:** `npm install`, then `npm run deploy` (builds and runs `wrangler deploy`, see `wrangler.jsonc`), then attach the custom domain chithii.com. For Cloudflare Pages instead: build command `npm run build`, output `dist`.
3. **www:** add a Cloudflare redirect rule `www.chithii.com/*` → `https://chithii.com/$1` (301).
4. **App config:** set the app's public URL, cookie domain and OAuth redirect URIs to `app.chithii.com`.
5. **Meta App Dashboard:** update App Domains, Privacy Policy URL (`https://chithii.com/privacy`), Terms URL (`/terms`), Data Deletion URL (`/data-deletion`), app icon and name, and the Valid OAuth Redirect URIs.
6. **Redirect the old domain:** deploy `legacy-redirects/_redirects` to the getassist.pro project, or add one Cloudflare redirect rule: `https://chithii.com${path}`, 301, keep query string. Do the same for `demo.getassist.pro/*` → `https://app.chithii.com/*`. The full URL map is in `legacy-redirects/url-map.csv`.
7. **Search:** add chithii.com to Google Search Console, submit `https://chithii.com/sitemap-index.xml`, and use the Change of Address tool on the getassist.pro property.
8. Keep getassist.pro registered and redirecting for at least 12 months.

## 5. Working on the site

```bash
npm install
npm run dev       # local dev server
npm run build     # static build into dist/
npm run brand     # regenerate favicon, icons and og-image.png from the Chithii mark
```

- Brand, domain, emails, founders, app URL and legal dates are all in `src/config/site.ts`.
- Feature list: `src/data/features.ts`. Integrations: `src/data/integrations.ts`.
- Do not use inline `style=""` attributes or inline scripts: the CSP blocks them. Use Tailwind classes.
