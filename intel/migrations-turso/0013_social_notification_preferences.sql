PRAGMA foreign_keys=ON;

CREATE TABLE notification_preferences(
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  friend_requests INTEGER NOT NULL DEFAULT 1 CHECK(friend_requests IN(0,1)),
  friend_accepts INTEGER NOT NULL DEFAULT 1 CHECK(friend_accepts IN(0,1)),
  messages INTEGER NOT NULL DEFAULT 1 CHECK(messages IN(0,1)),
  in_app INTEGER NOT NULL DEFAULT 1 CHECK(in_app IN(0,1)),
  push INTEGER NOT NULL DEFAULT 1 CHECK(push IN(0,1)),
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_notifications_user_unread_time
ON notifications(user_id,read_at,created_at DESC,id DESC);

INSERT OR IGNORE INTO schema_migrations(version,applied_at)
VALUES('0013_social_notification_preferences',unixepoch()*1000);
