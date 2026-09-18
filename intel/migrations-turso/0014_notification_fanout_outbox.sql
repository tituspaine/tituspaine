PRAGMA foreign_keys=ON;

CREATE TABLE notification_fanout_jobs(
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL REFERENCES investigations(id),
  update_id TEXT NOT NULL REFERENCES investigation_updates(id),
  exclude_user_id TEXT REFERENCES users(id),
  cursor_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN('PENDING','RUNNING','DONE')),
  lease_owner TEXT,
  lease_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(investigation_id,update_id)
);

CREATE INDEX idx_notification_fanout_jobs_status
ON notification_fanout_jobs(status,lease_expires_at,updated_at,id);

INSERT OR IGNORE INTO schema_migrations(version,applied_at)
VALUES('0014_notification_fanout_outbox',unixepoch()*1000);
