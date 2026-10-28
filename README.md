# Titus Paine

Personal portfolio at https://tituspaine.com. The `main` branch is the personal site; `intel-*` branches are separate applications and must not be merged into this site.

## Structure

- `index.html`: founder homepage, authentic selected-project previews, metadata, and a custom chess challenge button at the bottom.
- `work/`, `about/`, `legal-access/`, `experiments/`, `chess/`: complete destination pages.
- `interactive.css`: shared LegalShield/chess styles; `site.js`: mobile navigation and reading progress.
- `editorial.css`: responsive editorial design and reduced-motion/accessibility rules.
- `assets/titus-paine-portrait.jpg`: user-approved replacement portrait, also used in social metadata.
- `assets/wet1d-preview.png`, `assets/dctpa-preview.jpg`: genuine public website captures.
- `robots.txt` / `sitemap.xml`: five-page discovery.
- `tests/site.test.cjs`: dependency-free regression tests.

Run `node --test tests/*.test.cjs` with Node 22 or newer. No frontend build or package installation is needed. Preserve the existing hosting connection and production branch. `wrangler.jsonc` describes a static-assets Worker if Cloudflare deploys this repository; GitHub Pages deployment is also enabled in the repository.

The chess engine loads from the existing pinned chess.js CDN URL; a visible failure status is provided if it cannot load. LegalShield is an independent-associate referral, not legal advice; retain its disclosure and provider link.

Before a release, test the full page at narrow/mobile and wide/desktop widths, keyboard navigation, the five LegalShield cards, chess side/difficulty/restart, all anchors and external destinations. Do not infer browser visual QA from the unit tests alone.

The chess challenge is a joke:70–110 random result independent of play and fictional Titus136 display record. Both Try again and Exit first reveal the prank, then require Continue before routing. No result is stored or used as a real IQ assessment.
