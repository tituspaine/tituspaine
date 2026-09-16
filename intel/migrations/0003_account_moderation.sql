PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN deactivated_at INTEGER;
ALTER TABLE users ADD COLUMN username_changed_at INTEGER;

CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  push_replies INTEGER NOT NULL DEFAULT 1 CHECK(push_replies IN (0,1)),
  push_followed_updates INTEGER NOT NULL DEFAULT 1 CHECK(push_followed_updates IN (0,1)),
  push_major_evidence INTEGER NOT NULL DEFAULT 1 CHECK(push_major_evidence IN (0,1)),
  push_platform_notice INTEGER NOT NULL DEFAULT 1 CHECK(push_platform_notice IN (0,1)),
  updated_at INTEGER NOT NULL
);

CREATE TABLE security_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  event_type TEXT NOT NULL,
  risk_key_hash TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_security_events_type_time ON security_events(event_type, created_at DESC);
CREATE INDEX idx_security_events_risk_time ON security_events(risk_key_hash, created_at DESC);

CREATE TRIGGER comments_no_content_update
BEFORE UPDATE OF content,author_user_id,created_at,parent_id,root_id,depth ON comments
BEGIN
  SELECT RAISE(ABORT, 'published comments are immutable');
END;

CREATE TRIGGER comments_no_delete
BEFORE DELETE ON comments
BEGIN
  SELECT RAISE(ABORT, 'published comments cannot be deleted');
END;

CREATE TRIGGER updates_no_content_rewrite
BEFORE UPDATE OF content,title,type,author_user_id,created_at,published_at ON investigation_updates
BEGIN
  SELECT RAISE(ABORT, 'published investigation entries require a correction record');
END;
