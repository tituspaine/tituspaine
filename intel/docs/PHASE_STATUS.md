# INTEL V3 phase status

- Phase 0: COMPLETE — actual repository/runtime audit established `src/entry.ts` as the Worker entry and documented legacy D1.
- Phase 1: COMPLETE — provider-neutral `IntelDatabase` boundary with D1 rollback adapter and Turso/libSQL adapter.
- Phase 2: COMPLETE/VALIDATED — Turso migrations 0001–0004 have been applied and remotely validated against `intel-v3-validation`; latest successful validation Run ID `bee3b4c0-aa3d-42f3-bbfe-f865ddd679f2`.
- Phase 3: COMPLETE — auth/account/session paths are provider-neutral. Registration is atomic, passwords use PBKDF2-SHA256, session tokens are random and only peppered SHA-256 digests are stored.
- Phase 4: COMPLETE — live application routes use repositories/provider-neutral DB context. D1 remains only as explicit pre-cutover rollback provider.
- Phase 5: COMPLETE FOR PRODUCTION GATE — graph supports temporal relationships, confidence/verification, multiple source/evidence provenance records, relationship FTS, expanded entity kinds, aliases, deterministic bounded candidate resolution and merge-history schema. No automatic entity merging.
- Phase 6: COMPLETE FOR PRODUCTION GATE — hot mutations use atomic maintained counters instead of repeated COUNT reconciliation; public anonymous paths avoid user-state subqueries; reads are bounded/projected; search uses bounded FTS; public cache classes are explicit.
- Phase 7: COMPLETE FOR PRODUCTION GATE — primary UX is server-rendered semantic HTML/native forms. Global INTEL client JS/service worker layers were removed; Turnstile remains the intentional registration exception.
- Phase 8: COMPLETE FOR PRODUCTION GATE — request DB metrics exist; cheap pre-DB per-isolate burst limits cover auth/search/writes/evidence. This is defense-in-depth, not a globally consistent quota; Cloudflare edge rate limiting remains the preferred future global layer if available free.
- Phase 9: COMPLETE FOR PRODUCTION GATE — CI typecheck/tests run on every branch change; remote Turso validation proved migrations, FTS, graph/provenance, extended entity kinds, transaction rollback and cleanup.
- Phase 10: READY FOR EXTERNAL PRODUCTION TURSO PROVISIONING.
- Phase 11: BLOCKED on production database/account configuration and live cutover verification.

## Remote Turso validation evidence
Validated migrations: `0001_core`, `0002_search`, `0003_graph_provenance`, `0004_entity_kinds_search`.
Validated behavior: schema migration tracking, FTS5, atomic graph write, relationship→evidence provenance, ADDRESS entity constraint, relationship FTS, atomic rollback, cleanup.
Validation database is disposable/non-production and MUST NOT be reused as production.

## Production cutover sequence
1. Create a separate production Turso database on the free plan.
2. Configure its URL/token as encrypted Worker secrets; never commit token material.
3. Apply the same pinned migrations and run production-safe validation before traffic cutover.
4. Bootstrap the owner/admin identity securely.
5. Set `PERSISTENCE_PROVIDER=turso` only after production validation.
6. Verify auth, permissions, graph, evidence, search, community, moderation, navigation, caching and DB usage.
7. Keep D1 bound but unused for a short rollback window.
8. Remove validation bootstrap page/routes and `TURSO_VALIDATION_BOOTSTRAP_TOKEN`.
9. Remove D1 binding/runtime adapter only after Turso stability is proven.
10. Verify Worker operates with zero D1 bindings, then archive/delete only the INTEL D1 database. Never alter Orendrix.

## Current Turso free capacity baseline (checked 2026-09-17)
Official Turso pricing currently lists Free: 100 databases, 5 GB storage, 500 million rows read/month, 10 million rows written/month, 3 GB monthly syncs, 1-day point-in-time restore. Capacity planning assumes no paid overages.

### INTEL planning envelope
The dominant risk is rows read, not storage, if pages repeatedly scan/count. Current architecture therefore uses FTS, bounded projections, maintained counters and shared caching for anonymous public pages.

Approximate normal-use model (engineering budget, not a provider guarantee):
- 1,000 DAU × 20 dynamic requests/day × ~20 rows read/request ≈ 12M rows read/month.
- 5,000 DAU × 20 × ~20 ≈ 60M rows read/month.
- 10,000 DAU × 20 × ~20 ≈ 120M rows read/month.
- At 10,000 DAU, even 40 requests/day × 30 rows/request ≈ 360M rows read/month, below 500M but with much less safety margin.
- Writes budget: 10,000 DAU × 5 user mutations/day × ~3 relational rows/mutation ≈ 4.5M rows written/month. Evidence binaries remain in R2, not relational storage.

Public Cloudflare caching can materially reduce anonymous DB reads; authenticated traffic is intentionally private/no-store. Capacity must be measured from live request DB metrics after cutover and revisited before sustained traffic approaches 70% of any free allowance.

## Stabilization rules
- Production remains on D1 until the separate production Turso database is validated and the explicit cutover occurs.
- Keep D1 as rollback capability through the live verification window.
- Never commit Turso auth tokens, session peppers, Turnstile secrets or bootstrap tokens.
- Orendrix is outside this project and must not be modified.
