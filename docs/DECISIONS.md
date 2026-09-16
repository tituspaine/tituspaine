# INTEL Architecture Decisions

## ADR-001 — Preserve the root personal site
Status: accepted.

The existing root is a static personal website with its own custom-domain CNAME. INTEL will be additive under `/intel` in the repository and deployed separately to `intel.tituspaine.com`. No framework migration of the personal site is required to build INTEL.

## ADR-002 — Cloudflare-only runtime
Status: accepted.

Application runtime/storage/security dependencies are limited to Cloudflare Workers, D1, R2, Turnstile, DNS/CDN/cache/security/secrets/observability available to the account. No Supabase, Vercel, Firebase, Netlify, AWS, Azure, external auth, Algolia, or required LLM service.

## ADR-003 — Native navigation first
Status: accepted.

Canonical server routes and progressive enhancement are preferred over fragile SPA-only navigation. Browser Back, Forward, Refresh, deep linking, and shareable permalinks are product requirements.

## ADR-004 — Append-oriented public record
Status: accepted.

Comments are immutable to public authors. Significant official changes use version/correction records. Moderation changes visibility while preserving the underlying record and audit trail.

## ADR-005 — Structured entities from V1
Status: accepted.

Investigations do not store important real-world subjects only as strings. Entities, aliases, investigation links, relationships, sources, and evidence references receive durable IDs and constraints so future graph/intelligence features do not require destructive remodeling.

## ADR-006 — Four-character minimum is a risk exception
Status: accepted per explicit product requirement.

The application accepts a minimum password length of four characters, but treats it as an intentionally weak minimum. Compensating controls include Turnstile at registration, throttled authentication, generic errors, modern salted/versioned password derivation, secure opaque sessions, revocation, and abuse controls. This decision should be revisited if product policy changes.
