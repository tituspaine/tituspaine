# INTEL Database

D1 is authoritative for structured state. Migration `intel/migrations/0001_core.sql` establishes users/credentials/sessions, investigations and entries, follows/read state, evidence/sources/attachments, persistent entities/aliases/relationships, immutable comments, likes, reports/moderation, notifications/push, corrections/tags, and append-oriented audit events.

## Query rules

- No `SELECT *` on unbounded collections.
- Feed, updates, comments, notifications, audit events, and search are cursor-paginated.
- Counter fields on investigations/updates/comments prevent repeated `COUNT(*)` scans on hot public paths; mutation services are responsible for consistency.
- Every high-frequency filter/order has an explicit index.
- Public homepage reads investigations from `idx_investigations_feed` with a strict limit.
- Discussion loads roots/replies in bounded pages; it never recursively fetches one query per comment.
- Report threshold lookup uses `idx_reports_threshold` and the unique `(comment_id, reporter_user_id, category)` constraint.
- Entity lookup uses normalized canonical names/aliases and indexed keys.

## Integrity

Comments expose no user update/delete operation. Evidence objects are versioned rather than overwritten. Corrections preserve both representations. Moderation is visibility state plus queue/action/audit records. Session tokens are represented by digests, not raw bearer tokens.

## R2 boundary

D1 stores attachment metadata, object key, SHA-256, MIME, byte size, uploader, provenance, and version lineage. Binary payloads belong in R2 and are never stored as D1 blobs.
