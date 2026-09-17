# INTEL persistence boundary

Application/domain code uses `IntelDatabase`; provider SDK details remain inside this directory. Production relational state is Turso/libSQL only. There is no D1 adapter, binding, provider switch, or fallback path.

`databaseForRequest()` requires the production Turso URL and token. Missing configuration fails explicitly rather than silently selecting another database.

Every request may collect lightweight in-memory DB metrics. Metrics do not write telemetry back to the primary database.

For multi-statement atomic writes use `db.batch()`. The Turso Web/HTTP adapter intentionally exposes no interactive transaction API. Migrations are explicit operational actions and MUST NOT run automatically from `npm run deploy`.
