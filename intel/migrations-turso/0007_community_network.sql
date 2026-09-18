PRAGMA foreign_keys=ON;

-- Allow authors to edit contribution text while preserving structural immutability.
-- Every application edit is recorded in audit_events by the mutation path.
DROP TRIGGER IF EXISTS comments_no_content_update;
CREATE TRIGGER comments_no_structure_update
BEFORE UPDATE OF author_user_id,created_at,parent_id,root_id,depth,investigation_id ON comments
BEGIN
  SELECT RAISE(ABORT,'published comment structure is immutable');
END;

CREATE TABLE IF NOT EXISTS user_follows(
  follower_user_id TEXT NOT NULL REFERENCES users(id),
  followed_user_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(follower_user_id,followed_user_id),
  CHECK(follower_user_id<>followed_user_id)
);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_user_id,created_at DESC,follower_user_id);

CREATE TABLE IF NOT EXISTS saved_objects(
  user_id TEXT NOT NULL REFERENCES users(id),
  object_type TEXT NOT NULL CHECK(object_type IN('INVESTIGATION','COMMENT','EVIDENCE','ENTITY','RELATIONSHIP','UPDATE','CORRECTION')),
  object_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(user_id,object_type,object_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_objects_user_time ON saved_objects(user_id,created_at DESC,object_type,object_id);

CREATE TABLE IF NOT EXISTS activity_events(
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  investigation_id TEXT REFERENCES investigations(id),
  event_type TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'PUBLIC' CHECK(visibility IN('PUBLIC','PRIVATE','MODERATOR')),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_public_time ON activity_events(visibility,created_at DESC,id);
CREATE INDEX IF NOT EXISTS idx_activity_investigation_time ON activity_events(investigation_id,created_at DESC,id);
CREATE INDEX IF NOT EXISTS idx_activity_actor_time ON activity_events(actor_user_id,created_at DESC,id);

CREATE TABLE IF NOT EXISTS content_evidence_refs(
  content_type TEXT NOT NULL CHECK(content_type IN('COMMENT','UPDATE','CORRECTION')),
  content_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL REFERENCES evidence(id),
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(content_type,content_id,evidence_id)
);
CREATE INDEX IF NOT EXISTS idx_content_evidence_evidence ON content_evidence_refs(evidence_id,created_at DESC,content_type,content_id);

CREATE TABLE IF NOT EXISTS notification_preferences(
  user_id TEXT NOT NULL REFERENCES users(id),
  investigation_id TEXT NOT NULL REFERENCES investigations(id),
  mode TEXT NOT NULL DEFAULT 'IMPORTANT' CHECK(mode IN('ALL','IMPORTANT','REPLIES','MUTED')),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(user_id,investigation_id)
);

CREATE TABLE IF NOT EXISTS investigation_rules(
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL REFERENCES investigations(id),
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_investigation_rules ON investigation_rules(investigation_id,position,id);

CREATE TABLE IF NOT EXISTS investigation_participant_controls(
  investigation_id TEXT NOT NULL REFERENCES investigations(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  control TEXT NOT NULL CHECK(control IN('MUTED','BANNED','APPROVED')),
  reason TEXT,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(investigation_id,user_id,control)
);

CREATE TABLE IF NOT EXISTS comment_thread_state(
  comment_id TEXT PRIMARY KEY REFERENCES comments(id),
  locked INTEGER NOT NULL DEFAULT 0 CHECK(locked IN(0,1)),
  pinned INTEGER NOT NULL DEFAULT 0 CHECK(pinned IN(0,1)),
  updated_by TEXT REFERENCES users(id),
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO schema_migrations(version,applied_at) VALUES('0007_community_network',unixepoch()*1000);
