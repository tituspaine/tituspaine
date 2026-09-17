# INTEL community intelligence platform

`https://intel.tituspaine.com` is the community intelligence / investigation platform. It is separate from `intel.orendrix.com`, which is an Orendrix automated ingestion/intelligence system and is not part of this repository build.

## Production architecture

- Cloudflare Worker: `tituspaine-intel`
- Production branch: `intel-v2-build`
- Custom domain: `intel.tituspaine.com`
- Relational state: Turso/libSQL production database
- Binary evidence: Cloudflare R2 bucket `intel-evidence`, binding `EVIDENCE`
- Human verification: Cloudflare Turnstile
- UI: server-rendered semantic HTML/CSS; JavaScript is intentionally minimal and currently used for password visibility controls and Turnstile.
- No production LLM dependency.
- No D1 runtime dependency, fallback, binding, adapter, provider switch, or D1 deployment script.

## Required Worker configuration

Encrypted secrets/variables are managed outside git. Required production configuration includes `TURSO_PRODUCTION_DATABASE_URL`, `TURSO_PRODUCTION_AUTH_TOKEN`, `SESSION_PEPPER`, `TURNSTILE_SECRET_KEY`, and `ADMIN_USER_IDS` where owner/admin access is required. Never commit secret values.

Versioned non-secret configuration includes `APP_ORIGIN=https://intel.tituspaine.com`, `ENVIRONMENT=production`, the Turnstile site key, and the R2 binding.

## Validation

```bash
cd intel
npm install
npm run typecheck
npm test
npm run dev
```

CI performs typecheck and tests on branch changes. Deployment is intentionally separate from schema migration.

## Turso migrations

Production schema is applied through `0005_investigation_teams.sql`. Production validation verified migration tracking, investigation team schema, atomic graph writes, relationship FTS, provenance, transaction rollback, and cleanup.

`src/tursoProduction.ts` retains the explicit pinned migration/validation implementation for future controlled maintenance. It is deliberately not exposed as a public application route. Future migrations must be reviewed, pinned to an immutable repository commit, applied explicitly, validated, and only then followed by application code that requires the new schema.

## Product surfaces

INTEL provides public/authenticated feeds, investigations, following, threaded discussion, reactions, reports, investigation OWNER/MODERATOR teams, community evidence submission, R2-backed evidence files, source/provenance context, corrections, entities, relationships, deterministic FTS search, profiles, notifications, account/authentication, scoped moderation, admin publishing/tools/export, and a bounded owner system-health view.

Community evidence enters as `UNVERIFIED`; publication in INTEL is not itself verification. Authorization is enforced server-side. Public routes may use short shared caching; authenticated/private/admin routes are no-store.

## Scope boundary

`intel.tituspaine.com` = community intelligence / investigation platform.

`intel.orendrix.com` = separate Orendrix automated ingestion/intelligence system.

Never conflate their responsibilities, databases, deployment paths, or roadmaps.
