-- INTEL investigation comment posts + scoped tags
ALTER TABLE comments ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE comments ADD COLUMN tag_id TEXT REFERENCES tags(id);
ALTER TABLE investigations ADD COLUMN comment_tag_mode TEXT NOT NULL DEFAULT 'CREATOR_ONLY' CHECK(comment_tag_mode IN ('CREATOR_ONLY','COMMUNITY'));

CREATE TABLE investigation_comment_tags (
 investigation_id TEXT NOT NULL REFERENCES investigations(id),
 tag_id TEXT NOT NULL REFERENCES tags(id),
 created_by TEXT REFERENCES users(id),
 created_at INTEGER NOT NULL,
 PRIMARY KEY(investigation_id, tag_id)
);
CREATE INDEX idx_investigation_comment_tags ON investigation_comment_tags(investigation_id, tag_id);
CREATE INDEX idx_comments_root_page ON comments(investigation_id, parent_id, created_at DESC, id DESC);
