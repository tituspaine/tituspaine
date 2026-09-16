# INTEL V3 target architecture

## Principle
Simple outside; sophisticated inside. Minimize infrastructure work per user action without reducing intelligence capability.

## Runtime
Cloudflare Worker/API + Assets + Turnstile + edge cache. R2 owns binary evidence/media. Turso/libSQL owns relational state. Browser owns ephemeral UI state. No production feature depends on an LLM.

## Persistence boundary
Domain/routes -> `IntelDatabase` -> provider adapter -> Turso. Direct provider calls outside `src/db` are migration debt and must be removed phase-by-phase. Future PostgreSQL migration replaces the adapter rather than application behavior.

## Efficiency rules
No query-on-hover; no writes for navigation/filter state; no unbounded reads; cursor pagination for growing collections; batch screen reads; cache safe public responses; lazy-load secondary data; counters instead of repeated full counts where consistency rules permit; R2 instead of DB blobs; no telemetry system that writes per request to Turso.

## Production migration gate
D1 stays bound only while legacy calls are being converted. It is removed from Wrangler before production cutover. Turso credentials are Worker secrets and never committed.
