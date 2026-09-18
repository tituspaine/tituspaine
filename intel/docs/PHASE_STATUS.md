# INTEL V3 completion status

## Scope
INTEL at intel.tituspaine.com is the community intelligence and investigation platform. This branch does not modify the personal-site Worker, main, Orendrix, or Orendrix Properties.

## Current architecture
- Cloudflare Worker + static assets.
- Turso/libSQL is the sole relational production database.
- Cloudflare R2 stores evidence binaries.
- Turnstile protects registration.
- No production LLM dependency and no D1 runtime fallback.
- Durable model: Investigation -> Post -> Comment -> Reply, with dedicated post URLs.
- Structured intelligence: sources, evidence, entities, relationships, corrections, provenance and audit events.

## Schema
Production migrations 0001 through 0009 are applied. Migration 0009 adds indexes for bounded post/thread reads. The authenticated admin database maintenance surface remains available for controlled migration/validation; it is not a public bootstrap route.

## Reliability and scale controls
Growing reads are hard bounded. Public and private cache classes are separated. Search uses bounded FTS. Hot reactions use maintained counters and uniqueness constraints. Core publishing/reporting writes are separated from best-effort notification work where practical. Follower notification fan-out is bounded/chunked so request latency does not scale without limit. Request responses carry X-Request-Id for production correlation.

The in-memory rate limiter is defense-in-depth only; it is isolate-local and not a substitute for Cloudflare edge abuse controls. Endpoint classes distinguish auth, search, content, engagement, reports, evidence and admin operations.

## Navigation and mobile
Core navigation uses durable server-rendered URLs rather than SPA state. Investigation sections, posts, comment permalinks, evidence, entities, relationships, profiles, Following, Notifications, Account and Admin are direct routes. Post/comment activity links preserve post context. Mobile layout accounts for the bottom navigation and iPhone safe-area inset.

## Operations
System Health checks live DB reachability, reports DB response time, migration state, security state and bounded audit history. Admin Operations groups publishing, moderation, evidence/intelligence, health, export and database maintenance.

## Verification state
CI is configured to run TypeScript typecheck and Vitest for INTEL branch changes. GitHub connector status endpoints do not expose the push-triggered CI run in this environment, so a branch change is not described as CI-passed unless a run is independently observed. Production verification must remain distinct from repository implementation.

## Maintenance rules
1. Do not merge INTEL into main merely to deploy.
2. Do not modify the personal-site Worker or Orendrix from this branch.
3. Do not reintroduce D1.
4. Pin and validate future migrations before code depends on them.
5. Keep R2 binaries out of Turso.
6. Never shared-cache authenticated HTML.
7. Preserve server-side authorization even when controls are hidden.
8. Keep notification/analytics work from becoming a prerequisite for core writes.
