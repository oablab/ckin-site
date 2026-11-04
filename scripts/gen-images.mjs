// Generates icon.png (324), favicon.png (64), apple-touch-icon.png (180), og.png (zh), en/og.png and dev-note OG cards (zh and en).
// Usage: node scripts/gen-images.mjs <dir with @resvg/resvg-js and NotoSansTC-*.otf>
// The logo is the iOS app icon, scripts/app-icon.png (full-bleed, 1254×1254); every size is
// rendered from it here. Palette: icon green #275913 on cream, map pins in the map's own colours.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const tools = process.argv[2];
if (!tools) throw new Error('usage: node scripts/gen-images.mjs <tools dir>');
const { Resvg } = createRequire(join(tools, 'package.json'))('@resvg/resvg-js');
const fonts = ['Regular', 'Bold', 'Black'].map((w) => join(tools, `NotoSansTC-${w}.otf`));
const render = (svg, width) => new Resvg(svg, {
  fitTo: { mode: 'width', value: width },
  font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Noto Sans TC' },
}).render().asPng();

const uri = (png) => `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
let ICON = uri(readFileSync('scripts/app-icon.png'));
const GREEN = '#275913';
// iOS icon corner radius ≈ 22.37% of the side.
const iconImg = (x, y, s, round) => `
  ${round ? `<clipPath id="ic${x}${y}"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.2237}"/></clipPath>` : ''}
  <image href="${ICON}" x="${x}" y="${y}" width="${s}" height="${s}" ${round ? `clip-path="url(#ic${x}${y})"` : ''} preserveAspectRatio="none"/>`;
const iconSvg = (s, round) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${iconImg(0, 0, s, round)}</svg>`;

// icon.png: full-bleed square (CSS rounds it). apple-touch-icon: full-bleed, iOS masks it.
// favicon: rounded tile, as browsers show it unmasked.
// resvg resamples without mipmaps, so a one-step 1254 → 64 aliases the stamp's thin rings.
// Halve at most ~3× per step, each step reading the previous one.
// icon.png is 324 px: the hero shows it at 108 CSS px, so 3× covers iPhone screens (512 px
// was 370 KB with the stamp's speckle texture).
ICON = uri(render(iconSvg(648, false), 648));
const icon324 = render(iconSvg(324, false), 324);
writeFileSync('icon.png', icon324);
ICON = uri(icon324);
const icon180 = render(iconSvg(180, false), 180);
writeFileSync('apple-touch-icon.png', icon180);
ICON = uri(render(iconSvg(128, false), 128));
writeFileSync('favicon.png', render(iconSvg(64, true), 64));
ICON = uri(icon180);   // OG cards draw the icon at 88 px

const pin = (x, y, c, glyph = '', r = 26) => `
  <g transform="translate(${x} ${y})">
    <path d="M0 ${r * 1.9} L${-r * 0.55} ${r * 0.75} A${r} ${r} 0 1 1 ${r * 0.55} ${r * 0.75} Z" fill="${c}"/>
    <circle r="${r}" fill="${c}"/>
    ${glyph === 'pencil'   // drawn, Noto Sans TC has no U+270E
      ? `<path d="M${-r * 0.42} ${r * 0.42} L${-r * 0.3} ${r * 0.05} L${r * 0.22} ${-r * 0.47} L${r * 0.47} ${-r * 0.22} L${-r * 0.05} ${r * 0.3} Z" fill="#fff"/>`
      : glyph ? `<text y="${r * 0.36}" text-anchor="middle" font-size="${r}" font-weight="900" fill="#fff">${glyph}</text>` : ''}
  </g>`;

// Map pins use the map's semantic colours: --todo red, --done green ✓, --visited sage ✎, --closing amber.
const og = ({ kicker, title, sub, size = 78, subSize = 30 }) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAF6F0"/>
  <g opacity=".55">
    <rect x="700" y="0" width="500" height="630" fill="#EEF1E8"/>
    <path d="M700 250 L1200 200" stroke="#fff" stroke-width="22"/>
    <path d="M930 0 L980 630" stroke="#fff" stroke-width="22"/>
    <path d="M700 470 L1200 500" stroke="#fff" stroke-width="16"/>
    <path d="M700 560 L1200 530" stroke="#BFD9EA" stroke-width="44"/>
  </g>
  ${pin(800, 140, '#dc2626')}${pin(1060, 120, '#15803d', '✓', 30)}${pin(900, 300, '#9caf88', 'pencil', 32)}
  ${pin(1110, 330, '#dc2626')}${pin(820, 420, '#15803d', '✓', 30)}${pin(1020, 450, '#d97706')}
  <rect x="0" y="0" width="16" height="630" fill="${GREEN}"/>
  <rect x="79" y="51" width="90" height="90" rx="20" fill="none" stroke="rgba(39,89,19,.22)" stroke-width="2"/>
  ${iconImg(80, 52, 88, true)}
  <text x="192" y="108" font-size="30" font-weight="700" fill="${GREEN}">${kicker}</text>
  ${title.map((t, i) => `<text x="80" y="${238 + i * 92}" font-size="${size}" font-weight="900" fill="#2B1F14">${t}</text>`).join('')}
  ${sub.map((t, i) => `<text x="80" y="${238 + title.length * 92 + 36 + i * 44}" font-size="${subSize}" font-weight="400" fill="#75655A">${t}</text>`).join('')}
  <text x="80" y="580" font-size="30" font-weight="900" fill="${GREEN}">www.ckin.cc</text>
</svg>`;

writeFileSync('og.png', render(og({
  kicker: 'ckin・在地小吃打卡地圖',
  title: ['在地小吃，', '一家一家吃過去。'],
  sub: ['上千人評過的在地小吃，到現場才算數。', '台北・新北・基隆・宜蘭・紐約'],
}), 1200));
mkdirSync('en', { recursive: true });
writeFileSync('en/og.png', render(og({
  kicker: 'ckin · Local eats check-in map',
  title: ['Local eats,', 'one shop at a time.'], size: 62, subSize: 27,
  sub: ['Only counts if you were there.', 'Taipei, New Taipei, Keelung, Yilan, New York'],
}), 1200));
// Dev-note OG cards: <lang>/notes/<slug> → <lang>/notes/<slug>/og.png
const NOTES = {
  'zh/notes/why-ckin': { kicker: 'ckin 開發筆記 #1', title: ['那碗我從沒吃過的', '家鄉味'],
    sub: ['最珍貴的味道，原來一直在自己長大的地方。', '不是美食指南，是一個親自走進去的理由。'] },
  'zh/notes/around-you': { kicker: 'ckin 開發筆記 #2', title: ['打開就是', '你附近'],
    sub: ['地圖以你為中心，打卡紀錄切到 Threads，', '也能從 Google 地圖分享地點過來。'] },
  'en/notes/around-you': { kicker: 'ckin dev notes #2', title: ['Open it', 'where you are'], size: 70, subSize: 27,
    sub: ['Centered on you or on a place shared from', 'Google Maps. Past check-ins open in Threads.'] },
};
for (const [dir, t] of Object.entries(NOTES)) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/og.png`, render(og(t), 1200));
}
console.log('images written');
