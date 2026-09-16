# INTEL persistence boundary

Application/domain code uses `IntelDatabase`; provider SDKs belong only in this directory. `turso.ts` is the production libSQL adapter. This boundary allows a later PostgreSQL adapter without rewriting route/domain behavior.

Every request may collect lightweight in-memory DB metrics. Metrics do not write telemetry back to the primary database.

For multi-statement atomic writes use `db.batch()`. The Turso Web/HTTP adapter intentionally exposes no interactive transaction API; this avoids pretending an interactive transaction is portable/reliable in a Worker request. Migrations are a separate operational action and MUST NOT run from `npm run deploy`.
