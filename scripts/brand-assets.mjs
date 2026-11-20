// Generates every Chithii logo file, the favicon, the app icons and the Open Graph image
// from the master logo, logo/Colorful Chithii Ribbon Logo.png (a ribbon "C", the navy
// "hithii" wordmark and a violet-to-amber swoosh, on white).
// Run with `npm run brand` after changing the master logo, then commit the output.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const SOURCE = 'logo/Colorful Chithii Ribbon Logo.png';
const NAVY = '#040946'; // the wordmark
const NIGHT = '#040630';

// ---- 1. The master on a transparent background ("colour to alpha" against white) ---------------
const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const rgba = Buffer.alloc(W * H * 4);
for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const a = Math.max(255 - r, 255 - g, 255 - b) / 255;
  if (a < 0.02) continue; // pure background: fully transparent
  // Un-mix the white: the colour that, at alpha a over white, gives the pixel we see.
  rgba[o] = Math.round((r - 255 * (1 - a)) / a);
  rgba[o + 1] = Math.round((g - 255 * (1 - a)) / a);
  rgba[o + 2] = Math.round((b - 255 * (1 - a)) / a);
  rgba[o + 3] = Math.round(a * 255);
}
const transparent = () => sharp(rgba, { raw: { width: W, height: H, channels: 4 } });

// The same with the navy wordmark turned white, for dark backgrounds. The wordmark starts at
// x ≈ 700 in the master and is the only dark, unsaturated-bright part there.
const WORDMARK_X = 700;
const light = Buffer.from(rgba);
for (let y = 0; y < H; y++) {
  for (let x = WORDMARK_X; x < W; x++) {
    const o = (y * W + x) * 4;
    if (light[o + 3] === 0) continue;
    if (Math.max(light[o], light[o + 1], light[o + 2]) < 140) light[o] = light[o + 1] = light[o + 2] = 255;
  }
}

// Bounding box of everything visible, and of the ribbon "C" alone (left of the wordmark).
function bbox(buf, x0, x1, minAlpha = 24) {
  let left = x1, right = x0, top = H, bottom = 0;
  for (let y = 0; y < H; y++) {
    for (let x = x0; x < x1; x++) {
      if (buf[(y * W + x) * 4 + 3] >= minAlpha) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}
const full = bbox(rgba, 0, W);

// The ribbon C alone: the same pixels without the navy wordmark (the C's upper tip reaches past the
// first stroke of the "h", so a plain crop would keep a sliver of it).
const cOnly = Buffer.from(rgba);
for (let y = 0; y < H; y++) {
  for (let x = WORDMARK_X; x < W; x++) {
    const o = (y * W + x) * 4;
    if (Math.max(cOnly[o], cOnly[o + 1], cOnly[o + 2]) < 140) cOnly[o + 3] = 0;
  }
}
// ...and without the start of the swoosh, which begins under the C at about (595, 690).
const SWOOSH = { x: 560, y: 660 };
for (let y = SWOOSH.y; y < H; y++) for (let x = SWOOSH.x; x < W; x++) cOnly[(y * W + x) * 4 + 3] = 0;
const C = bbox(cOnly, 0, WORDMARK_X + 60, 96);

await mkdir('public/brand', { recursive: true });
const LOGO_H = 96; // 2× the 48px it is shown at
const logo = async (buf, name) => {
  const img = sharp(buf, { raw: { width: W, height: H, channels: 4 } }).extract(full).resize({ height: LOGO_H });
  await img.clone().png({ compressionLevel: 9 }).toFile(`public/brand/${name}.png`);
  await img.clone().webp({ quality: 92, alphaQuality: 100 }).toFile(`public/brand/${name}.webp`);
};
await logo(rgba, 'chithii-logo');
await logo(light, 'chithii-logo-light');

// The ribbon C, square, centred, for icons.
const side = Math.max(C.width, C.height);
const markPng = await sharp(cOnly, { raw: { width: W, height: H, channels: 4 } })
  .extract(C)
  .extend({
    top: Math.floor((side - C.height) / 2),
    bottom: Math.ceil((side - C.height) / 2),
    left: Math.floor((side - C.width) / 2),
    right: Math.ceil((side - C.width) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

/** The C on a white rounded tile (or full-bleed square), `pad` = share of the side left empty. */
const icon = async (size, { radius = 0.22, pad = 0.14, bg = '#ffffff' } = {}) => {
  const inner = Math.round(size * (1 - 2 * pad));
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * radius}" fill="${bg}"/></svg>`,
  );
  const c = await sharp(markPng).resize(inner, inner).toBuffer();
  return sharp(tile).composite([{ input: c, gravity: 'center' }]).png().toBuffer();
};

await sharp(markPng).resize(512, 512).png().toFile('public/brand/chithii-mark.png');
await writeFile('public/apple-touch-icon.png', await icon(180, { radius: 0, pad: 0.12 }));
await writeFile('public/icon-192.png', await icon(192));
await writeFile('public/icon-512.png', await icon(512));

// Favicons: plain PNGs of the C (no tile, so it reads on light and dark tabs), which every browser
// shows. (An SVG favicon wrapping a PNG was tried and can show blank in some browsers.)
const favPng = (size) => sharp(markPng).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
await writeFile('public/favicon-16x16.png', await favPng(16));
await writeFile('public/favicon-32x32.png', await favPng(32));
await writeFile('public/favicon-48x48.png', await favPng(48));

// favicon.ico with 16, 32 and 48 px PNG images (what /favicon.ico requests and Windows use).
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(favPng));
const icoHeader = Buffer.alloc(6 + 16 * icoSizes.length);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type: icon
icoHeader.writeUInt16LE(icoSizes.length, 4); // count
let icoOffset = icoHeader.length;
icoSizes.forEach((size, i) => {
  const e = 6 + 16 * i;
  icoHeader.writeUInt8(size, e); // width
  icoHeader.writeUInt8(size, e + 1); // height
  icoHeader.writeUInt8(0, e + 2); // palette
  icoHeader.writeUInt8(0, e + 3); // reserved
  icoHeader.writeUInt16LE(1, e + 4); // planes
  icoHeader.writeUInt16LE(32, e + 6); // bpp
  icoHeader.writeUInt32LE(icoImages[i].length, e + 8); // size
  icoHeader.writeUInt32LE(icoOffset, e + 12); // offset
  icoOffset += icoImages[i].length;
});
await writeFile('public/favicon.ico', Buffer.concat([icoHeader, ...icoImages]));

// Web app manifest: name, colours and the home-screen icons.
await writeFile(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'Chithii',
      short_name: 'Chithii',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#060b4f',
      background_color: '#ffffff',
      display: 'browser',
      start_url: '/',
    },
    null,
    2,
  ) + '\n',
);

// ---- 2. Open Graph image 1200×630: the logo on white, the promise in navy, the swoosh colours --------
const ogLogo = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract(full).resize({ width: 560 }).png().toBuffer();
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="swoosh" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#3400fa"/>
      <stop offset="0.35" stop-color="#9f03fb"/>
      <stop offset="0.65" stop-color="#f50368"/>
      <stop offset="1" stop-color="#fca601"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect y="618" width="1200" height="12" fill="url(#swoosh)"/>
  <text x="96" y="388" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="52" font-weight="700" fill="${NAVY}" letter-spacing="-1">Every conversation. Every team.</text>
  <text x="96" y="456" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="52" font-weight="700" fill="${NAVY}" letter-spacing="-1">Every channel. One place.</text>
  <text x="96" y="540" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="28" fill="#4b5280">WhatsApp · Messenger · Instagram · Telegram · Website chat   —   chithii.com</text>
</svg>`;
await sharp(Buffer.from(og))
  .composite([{ input: ogLogo, top: 70, left: 80 }])
  .png()
  .toFile('public/og-image.png');

console.log(`Brand assets written to public/ (logo ${full.width}×${full.height} in the master, C ${C.width}×${C.height}; night ${NIGHT}).`);
