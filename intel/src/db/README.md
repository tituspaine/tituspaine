# INTEL persistence boundary

Application/domain code uses `IntelDatabase`; provider SDKs belong only in this directory. `d1.ts` is the compatibility adapter used during migration. `turso.ts` is the target production libSQL adapter. This boundary also allows a later PostgreSQL adapter without rewriting route/domain behavior.

`databaseForRequest()` defaults to D1. Merely configuring Turso credentials does **not** switch providers. Production switches only when `PERSISTENCE_PROVIDER=turso` is explicitly configured and both Turso secrets are present. This prevents authentication or migrated routes from silently reading a different database than legacy routes.

Every request may collect lightweight in-memory DB metrics. Metrics do not write telemetry back to the primary database.

For multi-statement atomic writes use `db.batch()`. The Turso Web/HTTP adapter intentionally exposes no interactive transaction API. Migrations are a separate operational action and MUST NOT run from `npm run deploy`.
