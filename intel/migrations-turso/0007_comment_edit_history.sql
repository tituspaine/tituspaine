-- Preserve every user edit to comments/replies.
ALTER TABLE comments ADD COLUMN edited_at INTEGER;
CREATE TABLE comment_edits (
 id TEXT PRIMARY KEY,
 comment_id TEXT NOT NULL REFERENCES comments(id),
 editor_user_id TEXT NOT NULL REFERENCES users(id),
 previous_description TEXT NOT NULL DEFAULT '',
 previous_content TEXT NOT NULL,
 edited_at INTEGER NOT NULL
);
CREATE INDEX idx_comment_edits_comment ON comment_edits(comment_id,edited_at ASC,id ASC);
