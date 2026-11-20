// The chithii.com Worker. Pages are static files from dist/ (the ASSETS binding, with public/_headers and
// public/_redirects applied). The code here does three things:
//   1. www.chithii.com redirects to chithii.com (same path and query).
//   2. /api/geo tells the pricing page the visitor's country, currency and today's rate from US dollars.
//   3. /admin is the pricing admin portal: password sign-in (the ADMIN_PASSWORD secret), and an editor
//      whose Save commits src/data/pricing.json to GitHub (the GITHUB_TOKEN secret); Cloudflare then
//      rebuilds the site.
import { currencyByCountry } from './currencies.js';
import bundledPricing from '../src/data/pricing.json';
import { validatePricing } from './validate.js';

const RATES_URL = 'https://open.er-api.com/v6/latest/USD';
const RATES_SOURCE = { name: 'Rates by ExchangeRate-API', url: 'https://www.exchangerate-api.com' };
const RATES_TTL = 12 * 60 * 60; // seconds
const SESSION_TTL = 12 * 60 * 60; // seconds
const COOKIE = 'chithii_admin';
const MAX_FAILURES = 8; // wrong passwords per address before a 15-minute lockout

// The site's security headers (public/_headers), for responses this code builds itself.
const SECURITY = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // The Host header is the name the visitor typed (the same as url.hostname on Cloudflare).
    const host = (request.headers.get('host') || url.hostname).toLowerCase().split(':')[0];
    if (host === 'www.chithii.com') {
      url.hostname = 'chithii.com';
      url.protocol = 'https:';
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/geo') return geo(request, url, ctx);
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return admin(request, url, env, ctx);

    return env.ASSETS.fetch(request);
  },
};

// ---- /api/geo ---------------------------------------------------------------------------------------------

async function geo(request, url, ctx) {
  // ?country=XX lets anyone see the page as a visitor from XX would (it only changes their own view).
  const asked = (url.searchParams.get('country') || '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(asked) ? asked : (request.cf && request.cf.country) || 'XX';
  const currency = currencyByCountry[country] || 'USD';
  const out = { country, currency, rate: null, updated: null, source: null };

  if (currency === 'USD') out.rate = 1;
  else {
    const overrides = (bundledPricing.currency && bundledPricing.currency.overrides) || {};
    if (overrides[currency] > 0) {
      out.rate = overrides[currency];
      out.updated = 'set by Chithii';
    } else {
      const rates = await usdRates(ctx);
      if (rates && rates.rates[currency] > 0) {
        out.rate = rates.rates[currency];
        out.updated = rates.updated;
        out.source = RATES_SOURCE;
      }
    }
  }
  return json(out, 200, { 'Cache-Control': 'private, no-store' });
}

/** Today's rates from US dollars, cached for 12 hours at the edge. null if the service is unreachable. */
async function usdRates(ctx) {
  const cache = caches.default;
  const key = new Request('https://chithii.com/__internal/usd-rates');
  const hit = await cache.match(key);
  if (hit) return hit.json();
  try {
    const res = await fetch(RATES_URL, { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const body = await res.json();
    if (body.result !== 'success' || !body.rates) return null;
    const data = { rates: body.rates, updated: (body.time_last_update_utc || '').slice(5, 16) };
    ctx.waitUntil(cache.put(key, new Response(JSON.stringify(data), { headers: { 'Cache-Control': `max-age=${RATES_TTL}` } })));
    return data;
  } catch {
    return null;
  }
}

// ---- /admin -----------------------------------------------------------------------------------------------

async function admin(request, url, env, ctx) {
  if (!env.ADMIN_PASSWORD) {
    return page(
      'Admin portal not set up',
      `<p>Set the <code>ADMIN_PASSWORD</code> secret on the Worker to turn the admin portal on.</p>`,
      503,
    );
  }
  const path = url.pathname.replace(/\/+$/, '') || '/admin';

  if (path === '/admin/login' && request.method === 'POST') return login(request, env, ctx);
  if (path === '/admin/logout' && request.method === 'POST') {
    return new Response(null, { status: 303, headers: { Location: '/admin', 'Set-Cookie': cookie('', 0), ...SECURITY } });
  }

  const signedIn = await validSession(request, env);
  if (path === '/admin') return signedIn ? editorPage() : loginPage();

  if (path === '/admin/api/pricing') {
    if (!signedIn) return json({ error: 'Please sign in again.' }, 401);
    if (request.method === 'GET') return loadPricing(env);
    if (request.method === 'PUT') {
      // Only the editor page itself can save: same origin, and a header a form on another site cannot send.
      const origin = request.headers.get('origin');
      if ((origin && new URL(origin).host !== url.host) || request.headers.get('x-chithii-admin') !== '1') {
        return json({ error: 'Refused.' }, 403);
      }
      return savePricing(request, env);
    }
    return json({ error: 'Method not allowed.' }, 405);
  }
  return page('Not found', '<p><a href="/admin">Back to the admin portal</a></p>', 404);
}

async function login(request, env, ctx) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const cache = caches.default;
  const failKey = new Request(`https://chithii.com/__internal/admin-fail/${encodeURIComponent(ip)}`);
  const fails = Number((await (await cache.match(failKey))?.text()) || 0);
  if (fails >= MAX_FAILURES) return loginPage('Too many wrong passwords. Try again in 15 minutes.', 429);

  let password = '';
  try {
    password = String((await request.formData()).get('password') || '');
  } catch {}
  if (await sameSecret(password, env.ADMIN_PASSWORD)) {
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
    const token = `${exp}.${await sign(env.ADMIN_PASSWORD, String(exp))}`;
    return new Response(null, { status: 303, headers: { Location: '/admin', 'Set-Cookie': cookie(token, SESSION_TTL), ...SECURITY } });
  }
  ctx.waitUntil(cache.put(failKey, new Response(String(fails + 1), { headers: { 'Cache-Control': 'max-age=900' } })));
  await new Promise((r) => setTimeout(r, 800)); // slow down guessing
  return loginPage('That password is not right.', 401);
}

function cookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

async function validSession(request, env) {
  const raw = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [exp, mac] = raw.slice(COOKIE.length + 1).split('.');
  if (!exp || !mac || Number(exp) < Date.now() / 1000) return false;
  return sameSecret(mac, await sign(env.ADMIN_PASSWORD, exp));
}

async function sign(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`chithii-admin-session|${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison of two strings (compares their SHA-256 digests). */
async function sameSecret(a, b) {
  const [da, db] = await Promise.all(
    [a, b].map(async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s))))),
  );
  let diff = 0;
  for (let i = 0; i < da.length; i++) diff |= da[i] ^ db[i];
  return diff === 0;
}

// ---- Pricing file in GitHub ---------------------------------------------------------------------------------

function github(env, path, init = {}) {
  return fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'chithii-admin',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
}

function fromBase64(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function loadPricing(env) {
  if (!env.GITHUB_TOKEN) {
    return json({ pricing: bundledPricing, sha: null, canSave: false, note: 'GITHUB_TOKEN is not set, so changes cannot be saved yet.' });
  }
  const res = await github(env, `${env.PRICING_PATH}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
  if (!res.ok) {
    return json({ pricing: bundledPricing, sha: null, canSave: false, note: `GitHub answered ${res.status}; showing the published prices, read-only.` });
  }
  const file = await res.json();
  return json({ pricing: JSON.parse(fromBase64(file.content)), sha: file.sha, canSave: true });
}

async function savePricing(request, env) {
  if (!env.GITHUB_TOKEN) return json({ error: 'GITHUB_TOKEN is not set on the Worker, so changes cannot be saved.' }, 503);
  let body;
  try {
    const text = await request.text();
    if (text.length > 300_000) return json({ error: 'That is too large.' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'That is not valid JSON.' }, 400);
  }
  const problems = validatePricing(body.pricing);
  if (problems.length) return json({ error: 'Please fix these first.', problems }, 422);

  body.pricing.updated = new Date().toISOString().slice(0, 10);
  const res = await github(env, env.PRICING_PATH, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: body.message ? `Pricing: ${String(body.message).slice(0, 120)}` : 'Pricing updated from the admin portal',
      content: toBase64(JSON.stringify(body.pricing, null, 2) + '\n'),
      sha: body.sha || undefined,
      branch: env.GITHUB_BRANCH,
    }),
  });
  if (res.status === 409 || res.status === 422) {
    return json({ error: 'The prices were changed somewhere else since you opened this page. Reload, then make your change again.' }, 409);
  }
  if (!res.ok) return json({ error: `GitHub refused the change (${res.status}).` }, 502);
  const out = await res.json();
  return json({ ok: true, sha: out.content && out.content.sha, commit: out.commit && out.commit.html_url });
}

// ---- Pages --------------------------------------------------------------------------------------------------

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY, ...extra } });
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function page(title, body, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Chithii admin</title><meta name="robots" content="noindex, nofollow"><link rel="icon" href="/favicon.ico?v=2">
<link rel="stylesheet" href="/admin-ui/admin.css"></head><body><main class="shell">
<header class="top"><img src="/brand/chithii-logo.png" alt="Chithii" width="122" height="48"><span>Pricing admin</span></header>
${body}</main></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY } });
}

function loginPage(error = '', status = 200) {
  return page(
    'Sign in',
    `<form class="card login" method="post" action="/admin/login">
  <h1>Sign in</h1>
  <p class="muted">The pricing admin portal for chithii.com.</p>
  ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
  <button type="submit">Sign in</button>
</form>`,
    status,
  );
}

function editorPage() {
  return page(
    'Pricing',
    `<div class="bar"><h1>Pricing</h1>
  <form method="post" action="/admin/logout"><button class="ghost" type="submit">Sign out</button></form></div>
<p class="muted">Change anything below and press <strong>Save and publish</strong>. The site rebuilds with the new prices in a few minutes. Every save is kept in the site's history, so it can be undone.</p>
<div id="app" class="app"><p class="muted">Loading the current prices…</p></div>
<script src="/admin-ui/admin.js" defer></script>`,
  );
}
