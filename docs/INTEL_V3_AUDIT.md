# INTEL V3 — Phase 0 Audit

Status: completed baseline audit on `intel-v2-build` at commit `06803b235e44e7c48e7e091daf19ea8a7d3a3a15`.

## Scope guardrails

- INTEL lives under `/intel` and is developed on `intel-v2-build`.
- Do not merge into `main` during V3 work.
- The existing personal-site Worker on `main` is out of scope.
- `orendrix-properties` and its D1 database are out of scope.
- Production target remains a separate Worker serving `intel.tituspaine.com`.

## Live execution path

`intel/wrangler.jsonc` declares `src/entry.ts` as the Worker entrypoint.

`entry.ts` is an orchestration/router layer. It imports the older `src/index.ts` implementation as `core`, handles newer modular routes first, and delegates unmatched requests to `core.fetch(request, env)`. Therefore `index.ts` is NOT dead code today. It is a live compatibility/core implementation and cannot safely be deleted until its remaining routes are migrated.

Current modular areas include account, admin evidence, auth, corrections, entities, evidence, interactions, moderation, notifications, public records, security, and views. `entry.ts` also contains direct SQL for admin tools and post-response notification logic. The application therefore currently has SQL spread across route/domain files and the legacy core.

## Current persistence

`Env.DB` is a Cloudflare `D1Database`. `wrangler.jsonc` binds it to `intel-db` (`9f678576-9b15-47b0-8178-e1d8362772cb`). R2 is already bound as `EVIDENCE` to `intel-evidence`.

Normal deployment has already been decoupled from migrations: `npm run deploy` is `wrangler deploy`; explicit D1 migration scripts remain as `db:local` and `db:remote`. V3 must remove the production D1 dependency and replace those migration commands with controlled provider-neutral/Turso migration tooling.

## Schema baseline

The current SQLite/D1 model already contains useful foundations that should be preserved rather than rewritten blindly:

- users, credentials and hashed server-side sessions
- investigations, updates, follows and read state
- sources, evidence and R2 attachment metadata
- entities, aliases, investigation/entity links and directed entity relationships
- threaded comments and likes
- reports, moderation queue/actions
- notifications and push subscriptions
- corrections
- tags
- audit events
- user roles
- FTS5 unified search index

Important integrity mechanisms include unique normalized emails/usernames, unique session token hashes, foreign keys, compound primary keys for follows/likes, relationship indexes, feed indexes, notification indexes and audit indexes.

## Search

Migration `0002_search_roles.sql` creates an FTS5 `search_index`, bulk-populates investigations/updates/evidence/entities, and maintains part of it with triggers. This is SQLite-specific by design and therefore a good immediate fit for Turso/libSQL, but it must be isolated behind INTEL search repositories/services so a future PostgreSQL migration can replace FTS5 without rewriting route/business logic.

The current FTS maintenance is incomplete: inserts are covered for updates/evidence, but update/delete synchronization and alias/entity changes require a full audit before production.

## Authentication/security baseline

Authentication uses Web Crypto PBKDF2-SHA256 (310,000 iterations), random session tokens, SHA-256 token digests combined with `SESSION_PEPPER`, HttpOnly/Secure/SameSite=Lax cookies, Turnstile during registration, same-origin checks and security headers.

`currentUser()` performs a database session lookup only when the session cookie exists. The lookup joins `sessions` to `users` by unique `token_hash` and checks revocation/expiry. This is indexed and not inherently a high-row-scan query.

Registration currently performs multiple independent D1 operations and cleanup logic rather than a single explicit atomic transaction. V3 must make account creation atomic at the persistence boundary.

`validSameOrigin()` currently accepts a missing Origin header. That behavior must be reviewed per endpoint/method before production rather than assumed sufficient CSRF protection.

## Efficiency findings

The current architecture makes the database too visible to route code. This makes it difficult to enforce query budgets, swap providers, instrument operations, batch work, or prevent future N+1/query-regression problems.

Known examples in `entry.ts`:

- admin tools independently fetch up to 100 investigations and 200 entities
- post-response update notification logic performs an additional lookup after the legacy handler writes
- reply notification logic performs parent and latest-comment lookups after the legacy handler writes
- authenticated requests call `currentUser()` before routing, so any authenticated request incurs the session lookup even for endpoints that may not need user state

These are not necessarily individually expensive, but V3 should replace this pattern with purpose-built repository/service operations and screen-oriented API payloads.

## Frontend/runtime baseline

The Worker serves `/intel/public` assets and currently uses server-rendered HTML plus browser JavaScript/service-worker assets. V3 should retain the low-dependency approach unless a measured requirement justifies a framework. Navigation, auth coherence, deep-link refresh and forward/back behavior are production gates.

## V3 target architecture

```text
Browser
  -> Cloudflare Worker / edge cache / Turnstile
      -> application services
          -> INTEL repository/persistence interfaces
              -> Turso/libSQL adapter
      -> R2 for binary evidence/media
```

Provider credentials remain server-side Worker secrets. No Turso token may be shipped to browser code.

## Persistence abstraction requirements

The abstraction must be practical rather than an imaginary universal ORM. Separate concerns into domain-oriented repositories/services such as:

- identity/session
- investigations/community
- entities/relationships
- evidence/provenance
- search
- moderation
- notifications
- system/health

Provider-specific connection, statement/result conversion, transactions and usage instrumentation belong in the adapter layer.

A future PostgreSQL adapter may use different SQL/search implementations while preserving service-level contracts.

## V3 efficiency rules

1. No database operation exists only because it is convenient to code.
2. No unbounded list endpoint.
3. Prefer cursor/keyset pagination for growing collections.
4. No query-on-hover or database-backed transient UI state.
5. No polling without a documented need and budget.
6. No large binary payloads in the relational database.
7. Public repeatable reads should be classified for edge caching.
8. Private/user-specific responses must not enter shared caches.
9. Purpose-built screen payloads should replace request waterfalls where safe.
10. Hot queries require indexes and a documented expected access path.
11. Observability must be aggregated and cheap; it must not become a write-amplification system.
12. Abuse controls must protect expensive endpoints before launch.

## Migration strategy

Do not perform a flag-day rewrite. Preserve current behavior while introducing the persistence boundary, then move domains behind it in phases. D1 remains only a temporary development compatibility dependency until all live SQL has moved behind the adapter and Turso verification succeeds.

Migrations must remain separate from normal Worker deployment. A schema migration failure must never prevent an otherwise valid Worker code deployment merely because deployment automatically attempted database migration.

## Immediate Phase 1 work

1. Introduce provider-neutral database/repository contracts and query instrumentation.
2. Add a Turso/libSQL server-side adapter suitable for Cloudflare Workers.
3. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to the server environment contract without exposing either to public assets.
4. Build controlled migration tooling and a V3 schema baseline.
5. Move authentication/session persistence first because it is small, security-critical and easy to verify.
6. Continue domain-by-domain until no live route directly depends on D1.
7. Only then remove the D1 binding/configuration.

## External dependency gate

No user action is required for Phase 0/early Phase 1. Before real remote Turso integration tests, the owner must create/authorize a Turso database and configure its URL/token as Cloudflare Worker secrets. Secrets must not be pasted into chat or committed to GitHub.

## 2026-09-18 community intelligence refinement audit

- Production migration 0011_claims_feeds_moderation is applied; full production schema validation and live smoke verification remain separate gates.
- Community hierarchy is Investigation -> Post -> Comment -> Reply. Opened posts use bounded top-level reads and bounded immediate-child previews; whole descendant trees are not initial-page reads.
- Home exposes deterministic Best/Active/Latest modes. Following and notifications use keyset pagination. Custom feeds are pull-based to avoid write fan-out.
- Engagement and verification are architecturally independent. Claim status is explicit and evidence-oriented; comment likes cannot alter claim status or evidence verification.
- Contribution evidence references, structured claims, contextual moderation flags, entity dossiers, local Recently Viewed, local recent searches and density preferences are implemented on the development branch.
- Mobile primary navigation is Home, Latest, Search, Following, Account for authenticated users. Server-rendered URLs remain authoritative; JavaScript is progressive enhancement.
- Notification materialization for investigation updates is deliberately bounded; Following is the pull-based authoritative discovery path for audiences larger than the synchronous notification budget.
- Rate limiting is endpoint-specific but isolate-local and therefore defense-in-depth, not a global quota.
- Remaining production gates: validate 0011 schema, confirm final Worker deployment revision, then complete anonymous/authenticated/moderator/admin/mobile smoke matrix.
