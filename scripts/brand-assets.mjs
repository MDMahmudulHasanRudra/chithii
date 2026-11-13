// Generates the Chithii favicon, app icons and Open Graph image into public/.
// Run with `npm run brand` after changing the mark or colours, then commit the output.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const TIDE = '#0b3d45';
const DEEP = '#083138';
const ACCENT = '#2bb3bd';

const mark = (size, { radius = 0.22, bg = TIDE, fg = '#ffffff' } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
  <rect width="32" height="32" rx="${32 * radius}" fill="${bg}"/>
  <g stroke="${fg}" stroke-width="2.4" stroke-linecap="round" fill="none">
    <path d="M8.5 21V11.6A3.1 3.1 0 0 1 11.6 8.5h5"/>
    <path d="M23.5 11v9.4a3.1 3.1 0 0 1-3.1 3.1h-5"/>
  </g>
  <circle cx="21.8" cy="8.6" r="3" fill="${fg}"/>
  <circle cx="10.2" cy="23.4" r="3" fill="${fg}"/>
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

// favicon.svg
await writeFile('public/favicon.svg', mark(32).trim() + '\n');

// PNG icons (apple-touch-icon is full-bleed: iOS rounds it)
await writeFile('public/apple-touch-icon.png', await png(mark(180, { radius: 0 }), 180));
await writeFile('public/icon-192.png', await png(mark(192), 192));
await writeFile('public/icon-512.png', await png(mark(512), 512));

// favicon.ico containing one 48×48 PNG
const ico48 = await png(mark(48), 48);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count
header.writeUInt8(48, 6); // width
header.writeUInt8(48, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bpp
header.writeUInt32LE(ico48.length, 14); // size
header.writeUInt32LE(22, 18); // offset
await writeFile('public/favicon.ico', Buffer.concat([header, ico48]));

// Open Graph image 1200×630
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.7">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${DEEP}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96 150) scale(3.6)">
    <rect width="32" height="32" rx="7" fill="#ffffff"/>
    <g stroke="${TIDE}" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M8.5 21V11.6A3.1 3.1 0 0 1 11.6 8.5h5"/>
      <path d="M23.5 11v9.4a3.1 3.1 0 0 1-3.1 3.1h-5"/>
    </g>
    <circle cx="21.8" cy="8.6" r="3" fill="${TIDE}"/>
    <circle cx="10.2" cy="23.4" r="3" fill="${TIDE}"/>
  </g>
  <text x="250" y="232" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="92" font-weight="700" fill="#ffffff" letter-spacing="-2">Chithii</text>
  <text x="96" y="380" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="52" font-weight="600" fill="#ffffff" letter-spacing="-1">Every conversation. Every team.</text>
  <text x="96" y="448" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="52" font-weight="600" fill="#ffffff" letter-spacing="-1">Every channel. One place.</text>
  <text x="96" y="540" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="28" fill="#93b0b4">WhatsApp · Messenger · Instagram · Telegram · Website chat   —   chithii.com</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-image.png');

console.log('Brand assets written to public/');
