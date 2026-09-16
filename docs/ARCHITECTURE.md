# INTEL Architecture

## Existing repository audit

At V2 kickoff the repository root is deliberately small: `index.html`, `CNAME`, `README.md`, and `titus-headshot.png`. The existing personal site is a self-contained static HTML/CSS/JS document. `CNAME` points at `www.tituspaine.com`. INTEL must therefore be additive and must not replace the existing root-site architecture.

## Target topology

- `www.tituspaine.com`: existing personal site, preserved.
- `intel.tituspaine.com`: Cloudflare Worker application.
- Worker: server-rendered/public HTML where useful plus `/api/*` endpoints. History-safe real URLs are preferred over fake client routing.
- D1: authoritative structured application database.
- R2: immutable/versioned evidence and attachment objects.
- Turnstile: registration and risk challenges.
- Cloudflare cache/CDN: anonymous public investigation/feed responses where safe.
- GitHub: source, migrations, docs, deployment configuration, architecture decisions, and history.

## Repository layout

```text
/
  index.html                 existing personal site
  CNAME                      existing personal-site custom domain
  intel/
    src/
      index.ts               Worker entry/router
      auth/
      routes/
      services/
      security/
      views/
    public/
    migrations/
    tests/
    wrangler.toml
    package.json
  docs/
```

INTEL is isolated under `/intel` so the root personal site can evolve independently while remaining in the same required repository.

## Request architecture

1. Worker receives request and assigns/propagates request ID.
2. Security headers and method/body limits apply globally.
3. Route matcher dispatches canonical server routes and API routes.
4. Authentication resolves an opaque session cookie against D1 for protected operations.
5. Authorization occurs server-side on every mutation.
6. D1 service methods use parameterized statements and bounded/indexed queries.
7. Public cacheable GET responses never contain private/session-specific data.
8. Mutations append audit events in the same logical operation wherever possible.

## URL model

Canonical public routes include `/`, `/investigations/:slug`, `/investigations/:slug/updates/:id`, `/evidence/:id`, `/comments/:id`, `/search`, `/login`, `/register`, `/dashboard/*`, and `/admin/*`. Permanent internal IDs never change when slugs/display names change; aliases/redirects preserve old public URLs.

## Authentication

Email and username are normalized and uniquely indexed. Passwords are never stored plaintext. The implementation will use a Worker-compatible deliberately expensive password KDF with per-user random salts and versioned parameters; 4-character passwords are accepted per product requirement, while Turnstile, throttling, generic auth errors, breached/obvious-password defenses where locally feasible, and session security compensate for the weak minimum. Sessions use random opaque tokens; only a cryptographic token digest is stored in D1. Cookies are `Secure`, `HttpOnly`, scoped narrowly, and use an appropriate `SameSite` policy.

## Content/history model

Published investigation entries and comments are append-oriented. Comments have no public update/delete endpoint. Corrections are new records linking original and corrected representations. Moderation changes visibility state while retaining original material and emitting moderation/audit events.

## Ten-report rule

A unique constraint prevents the same reporter/category/comment combination from counting twice. Ten unique eligible accounts reporting the same category transition a visible comment to `AUTO_HIDDEN` atomically and create a moderation queue/audit event. Eligibility is deterministic and auditable; suspicious behavior can be challenged or accounts marked ineligible, but no hidden weighting changes the threshold.

## Performance

Feed and discussion queries are cursor-paginated. Investigation counters are maintained transactionally/explicitly rather than repeatedly scanning large tables. Hot anonymous pages are cacheable with short revalidation/invalidation strategy. Search uses D1 FTS where supported by the selected D1 feature set, otherwise indexed normalized search tables; no unbounded LIKE scans. No polling is required for core UX.

## Navigation

Real URLs and native browser history are authoritative. Any progressive enhancement must preserve deep links, refresh, Back/Forward, focus, and scroll restoration. Discussion permalinks resolve directly to their investigation context.

## Future-proofing

Entities use immutable IDs, aliases, typed relationships, source/evidence links, and temporal fields. This supports later graphs, parcels, contracts, public-record requests, meeting tracking, full-text documents, maps, and structured ingestion without redesigning investigations as flat posts.
