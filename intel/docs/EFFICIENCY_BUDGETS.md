# INTEL efficiency budgets

Regression targets, not permission to spend to the limit.

## Database
- Initial authenticated screen: target <= 8 DB statements including session lookup; consolidate when a screen exceeds this without a documented reason.
- Anonymous public request with no session cookie: exactly 0 session DB statements.
- Passive UI actions (scroll, hover, open/close, local filters): 0 DB writes.
- Growing collections: hard limit <= 50 by default; 20–30 preferred on mobile; use keyset/cursor pagination when pagination is exposed.
- Search: <=100 input characters, <=8 FTS tokens, <=40 result rows.
- Hot reaction/follow mutations: maintained counters; never post-mutation full COUNT reconciliation.
- Binary evidence/media: R2 only; never relational blobs.
- No `SELECT *` on production hot paths.
- Any hot endpoint query-plan regression requires explanation/fix before release.

## Cache classes
1. Auth/account/admin/moderation/private responses: `private, no-store`.
2. Public rapidly-changing investigation pages: short shared TTL (~20s) + SWR.
3. Public search: short shared TTL (~60s) + SWR; vary by URL query; authenticated search private.
4. Public reference/static assets: longer cache where immutable/versioned.
5. Never place authenticated HTML in a shared cache. Cookie-bearing responses use private/no-store and public cacheable responses vary on Cookie where applicable.

## Abuse budget
- Reject obvious bursts before creating the DB request context.
- Per-isolate in-memory limiter is defense-in-depth and intentionally creates zero DB writes.
- Current burst classes/minute: auth 12, search 90, generic writes 60, evidence uploads 12.
- Do not mistake isolate-local limits for globally consistent quotas; use free Cloudflare edge controls when available and justified.

## Telemetry
- Request-scoped DB metrics count operations/statements/errors/duration in memory.
- Never write one telemetry row per ordinary request.
- Prefer sampled/aggregated Cloudflare telemetry for global request/cache/error trends.
