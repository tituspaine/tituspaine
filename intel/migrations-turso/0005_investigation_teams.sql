PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS investigation_members(
  investigation_id TEXT NOT NULL REFERENCES investigations(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK(role IN('OWNER','MODERATOR')),
  created_at INTEGER NOT NULL,
  granted_by TEXT REFERENCES users(id),
  PRIMARY KEY(investigation_id,user_id)
);

CREATE INDEX IF NOT EXISTS idx_investigation_members_user ON investigation_members(user_id,role,investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_members_role ON investigation_members(investigation_id,role,user_id);

INSERT OR IGNORE INTO investigation_members(investigation_id,user_id,role,created_at,granted_by)
SELECT id,author_user_id,'OWNER',created_at,author_user_id
FROM investigations
WHERE author_user_id IS NOT NULL;

INSERT OR IGNORE INTO schema_migrations(version,applied_at) VALUES('0005_investigation_teams',unixepoch()*1000);
