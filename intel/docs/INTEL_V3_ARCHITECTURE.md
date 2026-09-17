# INTEL V3 production architecture

## Scope
`intel.tituspaine.com` is a community intelligence and investigation network. `intel.orendrix.com` is a separate Orendrix automated ingestion/intelligence machine. They are not the same product and must not share roadmaps by assumption. Automated ingestion, source harvesting, and an autonomous intelligence engine are permanently outside the scope of this INTEL build; those responsibilities belong only to the separate Orendrix system if pursued.

## Principle
Simple outside; sophisticated inside. INTEL exposes fast feeds, investigations, discussion and evidence while preserving structured provenance, graph context and accountability underneath.

## Runtime
Cloudflare Worker/API + static Assets + Turnstile + safe edge caching. R2 owns binary evidence/media. Turso/libSQL owns relational state. Browser state is ephemeral. No production feature depends on an LLM. The frontend is server-rendered semantic HTML/CSS with minimal JavaScript.

## Persistence boundary
Domain/routes -> `IntelDatabase` -> Turso adapter -> libSQL. Production is Turso-only. D1 has no runtime adapter, binding, provider switch, fallback or package script. R2 is the only binary evidence store.

## Community model
An investigation creator is an `OWNER` and follows their investigation automatically. Owners may grant/revoke `MODERATOR` only to followers. Self-promotion is rejected. Owners cannot be demoted through moderator controls. Owner/moderator authority is investigation-scoped and checked server-side. Administrators retain separate global moderation/publishing authority.

Comments support bounded threading, replies, likes, reports, visibility states, permalinks and moderation. Notifications cover replies, investigation contributions, reports, evidence contributions, moderation actions and team changes. Following and notifications are first-class routes rather than dashboard anchors. Opening an individual notification marks only that user's notification read before following its durable deep link. Public profiles include public investigations, discussion and evidence contributions. The home surface combines a bounded investigation list with a bounded mixed stream of updates, evidence, visible discussion and corrections.

## Evidence and provenance
Community evidence is always created as `UNVERIFIED`. Supported files are bounded to 20 MB and approved MIME types, hashed with SHA-256, stored in R2, and referenced by relational metadata. Optional original source URLs create source records. Evidence pages expose verification state, contributor, source, timestamps, file metadata and hash. Publication does not imply truth.

Entities and relationships remain deterministic. Relationships preserve confidence, verification state, observed/valid time, assertion notes, source/evidence provenance and public permalinks.

## Legal and community rules\nPublic Terms of Service, Terms of Use, and Acceptable Use Policy are durable first-class routes linked throughout the product. Account creation provides conspicuous notice of the 18+ eligibility rule and agreement to the service/use rules. Legal text must remain synchronized with actual platform behavior.\n\n## Search
FTS5 indexes investigations, updates, evidence, entities and relationships. Search is bounded, deterministic, parameterized and type-filterable. Results deep-link to durable server-rendered routes.

## Cache and performance
Authenticated/private/admin responses are `private, no-store`. Public feeds/search/evidence/entities/relationships/profiles use short bounded shared caching with stale-while-revalidate where safe. Queries project required columns, enforce limits, maintain counters on hot mutations, avoid polling/query-on-hover and keep telemetry out of the primary database. Request DB metrics are in-memory only.

## Security
Passwords use PBKDF2-SHA256 with stored salt/parameters; sessions store peppered SHA-256 token digests and have expiry/revocation. Cookies are Secure, HttpOnly and SameSite=Lax. Mutating routes enforce same-origin checks. Registration uses Turnstile. Per-isolate rate limiting is defense-in-depth for auth, search, writes and evidence; Cloudflare edge controls remain the preferred outer layer. CSP, frame denial, MIME sniff protection, referrer policy and permissions policy are applied globally.

## Operations
Production schema is migrated through `0005_investigation_teams`. The former browser migration console is removed. `src/tursoProduction.ts` retains the pinned explicit migration/validation implementation for controlled future maintenance but is not publicly routed. Owner system health uses bounded reads of migration/security/audit state and intentionally avoids per-request analytics writes.

## Navigation
Core navigation uses native links/forms and durable URLs. Mobile primary navigation is Home / Following / Notifications / Account. Investigation, comment, evidence, entity, relationship and profile content have direct deep links. There is no SPA router or client-side history dependency.
