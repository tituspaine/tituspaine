PRAGMA foreign_keys=ON;

ALTER TABLE notification_fanout_jobs
ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE notification_fanout_jobs
ADD COLUMN last_error TEXT;

CREATE INDEX idx_notification_fanout_jobs_retry
ON notification_fanout_jobs(status,attempts,lease_expires_at,updated_at,id);

INSERT OR IGNORE INTO schema_migrations(version,applied_at)
VALUES('0015_fanout_retry_health',unixepoch()*1000);
