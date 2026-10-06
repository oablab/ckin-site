// Generates icon.png, favicon.png, apple-touch-icon.png, og.png (zh) and en/og.png.
// Usage: node scripts/gen-images.mjs <dir with @resvg/resvg-js and NotoSansTC-*.otf>
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const tools = process.argv[2];
if (!tools) throw new Error('usage: node scripts/gen-images.mjs <tools dir>');
const { Resvg } = createRequire(join(tools, 'package.json'))('@resvg/resvg-js');
const fonts = ['Regular', 'Bold', 'Black'].map((w) => join(tools, `NotoSansTC-${w}.otf`));
const render = (svg, width) => new Resvg(svg, {
  fitTo: { mode: 'width', value: width },
  font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Noto Sans TC' },
}).render().asPng();

// App icon: chili-red tile, white map pin with a green check.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0602A"/><stop offset="1" stop-color="#B23A0B"/></linearGradient></defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <path d="M256 430s-118-104-118-196a118 118 0 0 1 236 0c0 92-118 196-118 196z" fill="#fff"/>
  <path d="M206 236l34 34 68-72" stroke="#15803d" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
writeFileSync('icon.png', render(icon, 512));
writeFileSync('apple-touch-icon.png', render(icon, 180));
writeFileSync('favicon.png', render(icon, 64));

const pin = (x, y, c, glyph = '', r = 26) => `
  <g transform="translate(${x} ${y})">
    <path d="M0 ${r * 1.9} L${-r * 0.55} ${r * 0.75} A${r} ${r} 0 1 1 ${r * 0.55} ${r * 0.75} Z" fill="${c}"/>
    <circle r="${r}" fill="${c}"/>
    ${glyph === 'pencil'   // drawn, Noto Sans TC has no U+270E
      ? `<path d="M${-r * 0.42} ${r * 0.42} L${-r * 0.3} ${r * 0.05} L${r * 0.22} ${-r * 0.47} L${r * 0.47} ${-r * 0.22} L${-r * 0.05} ${r * 0.3} Z" fill="#fff"/>`
      : glyph ? `<text y="${r * 0.36}" text-anchor="middle" font-size="${r}" font-weight="900" fill="#fff">${glyph}</text>` : ''}
  </g>`;

const og = ({ kicker, title, sub, size = 78, subSize = 30 }) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFF9F3"/>
  <g opacity=".55">
    <rect x="700" y="0" width="500" height="630" fill="#EEF1E8"/>
    <path d="M700 250 L1200 200" stroke="#fff" stroke-width="22"/>
    <path d="M930 0 L980 630" stroke="#fff" stroke-width="22"/>
    <path d="M700 470 L1200 500" stroke="#fff" stroke-width="16"/>
    <path d="M700 560 L1200 530" stroke="#BFD9EA" stroke-width="44"/>
  </g>
  ${pin(800, 140, '#dc2626')}${pin(1060, 120, '#15803d', '✓', 30)}${pin(900, 300, '#9caf88', 'pencil', 32)}
  ${pin(1110, 330, '#dc2626')}${pin(820, 420, '#15803d', '✓', 30)}${pin(1020, 450, '#d97706')}
  <rect x="0" y="0" width="16" height="630" fill="#D9480F"/>
  <text x="80" y="128" font-size="30" font-weight="700" fill="#B23A0B">${kicker}</text>
  ${title.map((t, i) => `<text x="80" y="${238 + i * 92}" font-size="${size}" font-weight="900" fill="#2B1D14">${t}</text>`).join('')}
  ${sub.map((t, i) => `<text x="80" y="${238 + title.length * 92 + 36 + i * 44}" font-size="${subSize}" font-weight="400" fill="#7A6556">${t}</text>`).join('')}
  <text x="80" y="580" font-size="30" font-weight="900" fill="#D9480F">www.ckin.cc</text>
</svg>`;

writeFileSync('og.png', render(og({
  kicker: 'ckin・台灣小吃打卡地圖',
  title: ['巷子裡的好味道，', '一家一家吃過去。'],
  sub: ['上千人評過的在地小吃，到現場才算數。', '台北・板橋・蘆洲・基隆'],
}), 1200));
mkdirSync('en', { recursive: true });
writeFileSync('en/og.png', render(og({
  kicker: 'ckin · Taiwan snack check-in map',
  title: ['Alley flavours,', 'one shop at a time.'], size: 62, subSize: 27,
  sub: ['Loved by thousands.', 'Only counts if you were there.'],
}), 1200));
console.log('images written');
