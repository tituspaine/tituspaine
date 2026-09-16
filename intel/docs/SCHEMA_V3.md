# INTEL V3 schema notes

The Turso baseline consolidates legacy D1 migrations 0001-0004 for a fresh V3 database. It retains immutable published comments/updates, provenance, evidence metadata, moderation and temporal relationship fields. Binary attachments remain object metadata only; bytes live in R2.

Search synchronization is deliberately stronger than legacy D1: investigation/entity/evidence deletes are handled, evidence updates are reindexed, and alias insert/update/delete refresh entity aliases. FTS remains deterministic and does not depend on AI.

New indexes cover active session token lookup, stable evidence pagination, relationship traversal and stable unread-notification ordering. Comment depth is bounded to protect rendering/query behavior. Self-referential entity relationships are rejected; if a legitimate self relationship is ever needed it must be modeled explicitly rather than accidentally inserted.
