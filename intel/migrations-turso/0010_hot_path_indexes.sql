PRAGMA foreign_keys=ON;

CREATE INDEX IF NOT EXISTS idx_notifications_user_time
ON notifications(user_id,created_at DESC,id DESC);

CREATE INDEX IF NOT EXISTS idx_investigation_follows_investigation_user
ON investigation_follows(investigation_id,user_id);

CREATE INDEX IF NOT EXISTS idx_comments_author_time
ON comments(author_user_id,created_at DESC,id DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_creator_time
ON evidence(created_by,created_at DESC,id DESC);

CREATE INDEX IF NOT EXISTS idx_investigations_public_updated
ON investigations(updated_at DESC,id DESC)
WHERE published_at IS NOT NULL;

INSERT OR IGNORE INTO schema_migrations(version,applied_at)
VALUES('0010_hot_path_indexes',unixepoch()*1000);
