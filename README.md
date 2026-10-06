# ckin-site

Marketing site for [ckin](https://ckin.cc), the Taiwan snack check-in map — served by GitHub Pages at **https://www.ckin.cc**.

- `/` — 繁體中文 (default), `/en/` — English, `/privacy/` — privacy policy
- Plain static HTML + `site.css`; no build step.
- `scripts/gen-images.mjs` regenerates `icon.png`, `favicon.png`, `apple-touch-icon.png`, `og.png`, `en/og.png`
  (needs a folder with `@resvg/resvg-js` and Noto Sans TC `.otf` files: `node scripts/gen-images.mjs <dir>`).

The app itself (Cloudflare Worker + D1) lives at `ckin.cc`.
