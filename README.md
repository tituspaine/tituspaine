# Titus Paine

Personal portfolio at https://tituspaine.com. The `main` branch is the personal site; `intel-*` branches are separate applications and must not be merged into this site.

## Structure

- `index.html`: semantic content, metadata, LegalShield cards, and chess interaction.
- `editorial.css`: responsive editorial design and reduced-motion/accessibility rules.
- `titus-headshot.png`: existing portrait (unchanged).
- `robots.txt` / `sitemap.xml`: homepage discovery.
- `tests/site.test.cjs`: dependency-free regression tests.

Run `node --test tests/*.test.cjs` with Node 22 or newer. No frontend build or package installation is needed. Preserve the existing hosting connection and production branch. `wrangler.jsonc` describes a static-assets Worker if Cloudflare deploys this repository; GitHub Pages deployment is also enabled in the repository.

The chess engine loads from the existing pinned chess.js CDN URL; a visible failure status is provided if it cannot load. LegalShield is an independent-associate referral, not legal advice; retain its disclosure and provider link.

Before a release, test the full page at narrow/mobile and wide/desktop widths, keyboard navigation, the five LegalShield cards, chess side/difficulty/restart, all anchors and external destinations. Do not infer browser visual QA from the unit tests alone.
