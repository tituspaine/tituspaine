# INTEL persistence boundary

Application/domain code must use `IntelDatabase`; provider SDKs belong only in this directory. `turso.ts` is the production libSQL adapter. This boundary exists so Turso can later be replaced by PostgreSQL without rewriting route/domain behavior.

Every request receives lightweight in-memory DB metrics. They deliberately do not write telemetry back to the primary database.

Migrations are a separate operational action and MUST NOT run from `npm run deploy`.
