# INTEL production verification — 2026-09-17

Production: `https://intel.tituspaine.com`
Worker: `tituspaine-intel`
Branch: `intel-v2-build`

## Live smoke results
A forced live fetch after the final product deployment verified:

- `/` — HTTP 200; current public INTEL feed rendered with compact search/navigation and no runtime error.
- `/search?q=Albany` — HTTP 200; deterministic search rendered and returned a clean empty state against the currently empty public dataset.
- `/login` — HTTP 200; login form rendered.
- `/register` — HTTP 200; registration form and Cloudflare Turnstile rendered.
- `/following` while logged out — redirected to `/login?return=%2Ffollowing` and rendered successfully.
- `/notifications` while logged out — redirected to `/login?return=%2Fnotifications` and rendered successfully.
- `/robots.txt` — HTTP 200; private/admin/API/system paths disallowed and sitemap advertised.
- `/sitemap.xml` — HTTP 200; valid XML generated from current public dataset.
- `/manifest.webmanifest` — HTTP 200; standalone INTEL manifest served.
- `/system/turso-production` — HTTP 404 after migration-console retirement, confirming the one-time browser migration surface is no longer publicly routed.

The current production database has no public investigations, so a real investigation/evidence/entity/relationship deep link could not be exercised without creating junk production records. Those routes are covered by repository routing/contracts and CI rather than polluting production for smoke testing.

## Database validation
Production Turso migrations `0001`–`0005` were previously applied and validated. Successful production validation Run ID: `297c409e-07ae-4ddd-9cf2-416cbdd18e4f`. Validation covered migration state, investigation team schema, atomic graph write, relationship FTS, provenance, atomic rollback and cleanup.

## CI
Final branch changes are required to pass `npm run typecheck` and `npm test` through INTEL CI. The completion contract additionally prevents D1 runtime/provider regressions and asserts the dedicated community surfaces, investigation authorization rules, evidence invariants, mobile destinations and search filter/deep-link behavior.

## Non-destructive verification rule
Registration, investigation creation, comments, reports, evidence uploads and moderation were not used as production smoke probes because doing so would create artificial public/user records. Their implementation is exercised by static/behavioral contracts, schema invariants and CI; real use should create only genuine platform data.
