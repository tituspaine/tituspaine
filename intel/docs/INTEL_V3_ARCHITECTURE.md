# INTEL V3 production architecture

## Product model
INTEL is a feed-first community intelligence network. The human browsing hierarchy is Home/Latest/Following -> Investigation -> Post -> Comment -> Reply. The intelligence hierarchy remains Investigation -> evidence/sources -> claims -> entities -> relationships -> corrections/provenance/timeline.

Popularity is never verification. Engagement counters rank community usefulness; verification state, source quality, claim state and provenance remain separate deterministic records.

## Runtime
Cloudflare Worker serves semantic server-rendered HTML with progressive JavaScript enhancement. Turso/libSQL is authoritative relational storage. R2 stores evidence binaries. Turnstile protects registration. Core production operation has no LLM dependency and no D1 fallback.

## Community reads
Investigation pages are living communities with durable section URLs. Post indexes are bounded. Opened posts load at most a bounded page of top-level comments plus a bounded three-reply preview per visible parent. Deeper discussion uses immediate-parent thread routes and keyset pagination rather than loading every descendant. Visual indentation is capped.

## Intelligence in discussion
content_evidence_refs attaches evidence to contributions without changing evidence verification. Structured claims are explicit records with UNVERIFIED/SUPPORTED/DISPUTED/CORRECTED states and separate SUPPORTS/CONTRADICTS/CONTEXT evidence links. A vote can never change a claim state.

## Feeds and discovery
Latest and private dashboard collections use keyset pagination. Home ranking is deterministic. Search uses bounded FTS. Recently viewed and recent searches are bounded browser-local history to avoid passive database writes. Custom feeds are pull-based collections of investigations rather than fan-out-on-write.

## Moderation
Removal/restoration, thread lock/pin and contextual moderation state are separate from factual verification. Contextual state supports source requested, misleading context, resolved and distinguished flags with audit events. Secondary author notifications are failure-contained.

## Security and caching
Mutations enforce same-origin checks and server-side authorization. Auth/account/admin/moderation are private/no-store. Anonymous public pages may use short shared caching only when personalized state is absent. Rate limiting is endpoint-classed isolate-local defense-in-depth.

## Navigation and mobile
URLs are authoritative. Mobile primary navigation is Home, Latest, Search, Following, Account for authenticated users. JavaScript adds optimistic interactions, recents, menu discipline and shortcuts but does not own routing. iPhone safe areas and 16px form controls are first-class.

## Schema
Production is currently applied through 0010. Migration 0011_claims_feeds_moderation is repository-implemented and must be applied before code paths that use claims/custom feeds/contextual moderation are considered production-ready.

## Visual identity and information color
INTEL uses an approximately 85/15 neutral-to-signal visual balance. Cobalt is the product/interaction identity. Emerald denotes supported/verified states, amber disputed/source-request states, crimson corrections/serious moderation states, navy public-record/evidence context, violet analysis/entity context, and orange-red genuinely fresh/breaking activity. These colors are semantic UI signals, never truth scores. Investigation accents are deterministic presentation identity only and do not encode verification or importance. Evidence, claims, entities and community posts intentionally have distinct visual grammar so mixed feeds remain scannable without becoming a dashboard of nested cards. Dark mode is intentionally not part of this pass.
