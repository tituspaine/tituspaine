# INTEL Changelog

## 2026-09-16 — V2 build begins

- Audited existing repository and preserved the static personal-site root architecture.
- Established isolated `/intel` application boundary.
- Recorded Cloudflare-only runtime and GitHub source-of-truth decisions.
- Added initial production D1 schema covering investigations, provenance/evidence, persistent entities, immutable discussion, moderation, notifications, and audit history.
- Added product, architecture, database, authentication, moderation, security, deployment, backup/recovery, and decision documentation.

## 2026-09-16 — Integrated V1 repository milestone

- Wired Managed Turnstile registration and Cloudflare-compatible session security.
- Added indexed FTS search, immutable comment/database guards, exact same-category report threshold, moderation review, account deactivation and password rotation.
- Added private R2 evidence ingestion/delivery with SHA-256 provenance and permanent evidence pages.
- Added persistent entities and sourced relationships, append-only corrections, update/comment likes, follower/reply notifications, read-state services, portable admin export, sitemap and robots discovery.
- Added installable PWA foundation, conservative service worker, native sharing controls, responsive editorial UI and CSP-compliant bootstrap.
- Activated integrated Worker entrypoint while preserving the separate personal-site Worker.
- Added isolated GitHub Actions verification for TypeScript and tests.
