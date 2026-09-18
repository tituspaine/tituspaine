# INTEL V3 production architecture

## Product model
INTEL is a community intelligence and investigation network. The primary community hierarchy is Investigation -> Post -> Comment -> Reply. Investigations also hold official updates, evidence, entities, relationships, corrections, team membership and audit history.

## Runtime and persistence
Cloudflare Worker serves semantic server-rendered HTML plus minimal JavaScript. Turso/libSQL owns relational state. R2 owns evidence binaries. Turnstile protects registration. Production has no LLM dependency and no D1 runtime/provider fallback.

## Community reads
Investigation Discussion is a bounded post index. A post has a durable /investigations/{slug}/posts/{id} route. Collection reads are bounded server-side; deep links use comment permalinks and post anchors. Visual nesting is capped so pathological depth does not destroy mobile layout. Database depth is bounded by schema.

## Writes and counters
Core mutations are small transactional batches. Unique constraints/INSERT OR IGNORE protect idempotent relationship-style actions such as likes/follows/saves where applicable. Maintained counters avoid repeated full COUNT queries. Notification work is secondary to successful core publishing/reporting and follower fan-out is bounded/chunked.

## Intelligence and provenance
Evidence, sources, entities, aliases, relationships, investigation/entity links and corrections remain deterministic relational records. R2 evidence is referenced by metadata and hashes. Community evidence enters UNVERIFIED. Relationship records preserve verification/provenance fields rather than turning discussion claims into facts automatically.

## Search
FTS5 provides bounded deterministic search across supported public object types. Input is capped at 100 characters and eight FTS tokens; result collections are bounded and type-filterable.

## Security
Passwords use PBKDF2-SHA256 with per-password salt and stored KDF parameters. Session tokens are random; only peppered SHA-256 digests are stored. Cookies are Secure, HttpOnly and SameSite=Lax. Mutations enforce same-origin validation. Authorization is checked server-side for global admin and investigation-scoped owner/moderator capabilities. CSP, framing denial, MIME protection, referrer policy and permissions policy are global.

Rate limiting is endpoint-classed and intentionally pre-DB, but the in-memory Worker limiter is isolate-local defense-in-depth rather than a global quota system.

## Caching
Authenticated/account/admin/moderation responses are private/no-store. Anonymous public pages may use short shared TTL + stale-while-revalidate. Cookie-varying responses never rely on shared personalized HTML. Versioned static JavaScript may be cached longer.

## Operations and observability
Responses carry X-Request-Id (Cloudflare Ray when present, otherwise a UUID). Unhandled failures log request ID, method and path without intentionally logging credentials. System Health performs a bounded live DB probe and reports migration/security/audit state. Production migrations are currently through 0009_post_thread_scaling.

## Navigation
The browser's native URL/history model is authoritative. Investigation sections use real query-string URLs. Posts/comments/evidence/entities/relationships/profiles have durable links. JavaScript progressively enhances likes, follows, saves, replies and sharing but is not the routing authority.
