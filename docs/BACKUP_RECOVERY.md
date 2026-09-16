# INTEL Backup & Recovery

INTEL must be recoverable independently of social networks and individual browser state.

## Required backup set

- GitHub: application code, configuration, migrations, docs, architecture/decision history.
- D1: scheduled/manual exports appropriate to Cloudflare capabilities, retained outside the live database according to an established rotation.
- R2: object inventory plus durable copies/versioning strategy appropriate to available Cloudflare capabilities.
- Attachment manifest: object key, SHA-256, size, MIME, evidence link, upload timestamp, version lineage.

## Recovery order

1. Restore/verify source revision.
2. Provision/bind D1 and apply schema migrations to the required version.
3. Restore structured data and run integrity checks.
4. Restore/verify R2 objects against stored SHA-256 values.
5. Restore Worker secrets/bindings through Cloudflare (never from source control).
6. Deploy Worker and bind `intel.tituspaine.com`.
7. Run smoke tests, authentication/session tests, investigation/evidence checks, comment immutability/moderation checks, and attachment hash sampling.
8. Re-enable normal publishing only after verification.

Backup procedures must be tested; an untested export is not considered a recovery plan.
