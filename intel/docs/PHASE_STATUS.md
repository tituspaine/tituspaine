# INTEL V3 completion status

## Scope
`intel.tituspaine.com` is the community intelligence / investigation platform. `intel.orendrix.com` is a separate Orendrix automated ingestion/intelligence system. This build does not include or modify Orendrix. Automated ingestion/intelligence-engine work is permanently excluded from this INTEL build.

## Completed architecture
- Cloudflare Worker `tituspaine-intel` serves the application and static assets.
- Turso/libSQL is the sole production relational database.
- Cloudflare R2 `intel-evidence` stores evidence binaries.
- Turnstile protects registration.
- Production functionality has no LLM dependency.
- D1 runtime code, types, provider switches, scripts and binding are removed.

## Schema and migration state
Production migrations `0001_core`, `0002_search`, `0003_graph_provenance`, `0004_entity_kinds_search`, and `0005_investigation_teams` are applied. Production validation passed migration tracking, investigation team schema, atomic graph write, relationship FTS, relationship provenance, atomic batch rollback and cleanup. Successful production validation Run ID recorded during cutover: `297c409e-07ae-4ddd-9cf2-416cbdd18e4f`.

The browser-accessible bootstrap/migration console was removed after cutover. `src/tursoProduction.ts` remains as an explicit pinned operational migration/validation implementation for future controlled maintenance and is not publicly routed.

## Product state
Implemented surfaces include public/authenticated home, universal FTS search with real filters, investigation creation/following, threaded discussion/replies/likes/reports, investigation OWNER/MODERATOR teams, scoped moderation, community evidence submission, R2 evidence files, evidence verification/source/provenance presentation, entities, relationship permalinks, corrections, public profiles, dedicated Following, dedicated Notifications, account/authentication, admin publishing/tools/export/moderation, and bounded owner System Health, a mixed recent-activity feed, individual notification read/deep-link behavior, public evidence contributions on profiles, Terms of Service, Terms of Use, and Acceptable Use Policy.

Mobile primary navigation is Home / Following / Notifications / Account. Core navigation is server-rendered/native, so direct URLs, refresh and browser history do not depend on SPA state.

## Security and abuse controls
Sessions use random tokens with peppered SHA-256 digests, expiry and revocation. Passwords use PBKDF2-SHA256 with per-password salt/parameters. Cookies are Secure/HttpOnly/SameSite=Lax. Server-side authorization protects admin and investigation roles. Same-origin validation protects mutations. Turnstile protects registration. Cheap pre-DB rate limits cover auth, search, writes and evidence. Global security headers include CSP, frame denial, MIME sniff protection, referrer policy and restrictive permissions policy.

Community evidence is always inserted as `UNVERIFIED`; only authorized workflows can assign stronger verification states. Uploads enforce MIME allowlist and 20 MB limit, use sanitized object keys, store SHA-256 metadata, and remove the R2 object if relational publication fails.

## Performance decisions
Public cacheable pages use short shared TTLs/stale-while-revalidate; user-specific/private/admin pages use no-store. Growing reads are bounded. Search is FTS-backed and bounded. Hot counters avoid repeated COUNT reconciliation. There is no polling, query-on-hover, UI-state persistence or per-request analytics write stream. Request DB metrics remain in memory. The owner health page uses bounded operational reads.

## Capacity engineering envelope
The design target remains viable for the planned community scale only if live usage stays within provider free allowances. The application therefore emphasizes bounded reads, maintained counters and public caching. Provider quotas must be monitored externally in Cloudflare/Turso because INTEL intentionally does not create an expensive self-telemetry pipeline.

## Verification
CI runs TypeScript typecheck and Vitest on every branch change. The suite includes schema/migration invariants, auth/security primitives, database contract/metrics, rate limiting, Turso production validation contracts, entity resolution, performance budgets and final completion contracts for Turso-only persistence, community routes, authorization, evidence, navigation and search.

## Maintenance rules
1. Never merge INTEL changes into `main` merely to deploy this Worker.
2. Never modify the personal `tituspaine` Worker from INTEL work.
3. Never reintroduce D1 as a fallback.
4. Review and pin future Turso migrations to an immutable commit; migrate/validate before deploying code that requires new schema.
5. Keep R2 binaries out of Turso.
6. Keep private responses out of shared caches.
7. Preserve server-side authorization even when UI controls are hidden.
8. Keep `intel.orendrix.com` and its automated ingestion responsibilities separate; never add automated ingestion to this INTEL build.\n9. Keep Terms of Service, Terms of Use, Acceptable Use, and future privacy/legal disclosures synchronized with actual product behavior.
