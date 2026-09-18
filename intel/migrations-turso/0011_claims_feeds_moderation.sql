PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS claims(
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL REFERENCES investigations(id),
  comment_id TEXT REFERENCES comments(id),
  statement TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK(status IN('UNVERIFIED','SUPPORTED','DISPUTED','CORRECTED')),
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_claims_investigation_time ON claims(investigation_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_claims_comment ON claims(comment_id,created_at DESC,id DESC);

CREATE TABLE IF NOT EXISTS claim_evidence(
  claim_id TEXT NOT NULL REFERENCES claims(id),
  evidence_id TEXT NOT NULL REFERENCES evidence(id),
  support_type TEXT NOT NULL CHECK(support_type IN('SUPPORTS','CONTRADICTS','CONTEXT')),
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(claim_id,evidence_id,support_type)
);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_evidence ON claim_evidence(evidence_id,claim_id);

CREATE TABLE IF NOT EXISTS custom_feeds(
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id,name)
);
CREATE INDEX IF NOT EXISTS idx_custom_feeds_user ON custom_feeds(user_id,updated_at DESC,id DESC);

CREATE TABLE IF NOT EXISTS custom_feed_investigations(
  feed_id TEXT NOT NULL REFERENCES custom_feeds(id),
  investigation_id TEXT NOT NULL REFERENCES investigations(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(feed_id,investigation_id)
);
CREATE INDEX IF NOT EXISTS idx_custom_feed_investigation ON custom_feed_investigations(investigation_id,feed_id);

CREATE TABLE IF NOT EXISTS content_moderation_state(
  comment_id TEXT PRIMARY KEY REFERENCES comments(id),
  source_requested INTEGER NOT NULL DEFAULT 0 CHECK(source_requested IN(0,1)),
  misleading_context INTEGER NOT NULL DEFAULT 0 CHECK(misleading_context IN(0,1)),
  resolved INTEGER NOT NULL DEFAULT 0 CHECK(resolved IN(0,1)),
  distinguished INTEGER NOT NULL DEFAULT 0 CHECK(distinguished IN(0,1)),
  duplicate_of_comment_id TEXT REFERENCES comments(id),
  updated_by TEXT REFERENCES users(id),
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post_best ON comments(parent_id,like_count DESC,reply_count DESC,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_content_evidence_content ON content_evidence_refs(content_type,content_id,created_at DESC,evidence_id);

INSERT OR IGNORE INTO schema_migrations(version,applied_at)
VALUES('0011_claims_feeds_moderation',unixepoch()*1000);
