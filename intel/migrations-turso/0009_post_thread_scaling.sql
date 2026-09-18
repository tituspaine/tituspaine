PRAGMA foreign_keys=ON;

-- Hot-path indexes for the Investigation -> Post -> Comment -> Reply model.
-- Root reply pagination must not scan the full comments table as threads grow.
CREATE INDEX IF NOT EXISTS idx_comments_root_time ON comments(root_id,created_at ASC,id ASC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_time ON comments(parent_id,created_at ASC,id ASC);
CREATE INDEX IF NOT EXISTS idx_comments_investigation_root_rank ON comments(investigation_id,parent_id,like_count DESC,reply_count DESC,created_at DESC,id DESC);

INSERT OR IGNORE INTO schema_migrations(version,applied_at) VALUES('0009_post_thread_scaling',unixepoch()*1000);
