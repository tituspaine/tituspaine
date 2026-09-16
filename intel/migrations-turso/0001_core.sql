-- INTEL V3 Turso/libSQL baseline.
-- Apply through the controlled migration process, never from Worker deploy.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at INTEGER NOT NULL);

-- Existing D1 schema 0001-0004 remains the canonical source during Phase 2 conversion.
-- The complete consolidated Turso baseline is generated only after compatibility audit so no production schema is partially applied.
