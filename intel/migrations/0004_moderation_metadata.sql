PRAGMA foreign_keys = ON;

ALTER TABLE comments ADD COLUMN moderation_reason TEXT;
ALTER TABLE comments ADD COLUMN moderated_at INTEGER;
