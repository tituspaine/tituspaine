PRAGMA foreign_keys=ON;

ALTER TABLE users ADD COLUMN date_of_birth TEXT;
ALTER TABLE users ADD COLUMN age_verified_at INTEGER;
ALTER TABLE users ADD COLUMN avatar_object_key TEXT;
ALTER TABLE users ADD COLUMN profile_visibility TEXT NOT NULL DEFAULT 'PUBLIC' CHECK(profile_visibility IN('PUBLIC','FRIENDS','PRIVATE'));
ALTER TABLE users ADD COLUMN notification_consent INTEGER NOT NULL DEFAULT 0 CHECK(notification_consent IN(0,1));
ALTER TABLE users ADD COLUMN cookie_consent INTEGER NOT NULL DEFAULT 0 CHECK(cookie_consent IN(0,1));
ALTER TABLE users ADD COLUMN terms_accepted_at INTEGER;

CREATE TABLE friendships(
  user_low_id TEXT NOT NULL REFERENCES users(id),
  user_high_id TEXT NOT NULL REFERENCES users(id),
  requested_by TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK(status IN('PENDING','FRIENDS','BLOCKED')),
  blocked_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(user_low_id,user_high_id),
  CHECK(user_low_id<user_high_id),
  CHECK(requested_by=user_low_id OR requested_by=user_high_id)
);
CREATE INDEX idx_friendships_low_status ON friendships(user_low_id,status,updated_at DESC,user_high_id);
CREATE INDEX idx_friendships_high_status ON friendships(user_high_id,status,updated_at DESC,user_low_id);

CREATE TABLE conversations(
  id TEXT PRIMARY KEY,
  user_low_id TEXT NOT NULL REFERENCES users(id),
  user_high_id TEXT NOT NULL REFERENCES users(id),
  last_message_id TEXT,
  last_message_preview TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL,
  UNIQUE(user_low_id,user_high_id),
  CHECK(user_low_id<user_high_id)
);
CREATE INDEX idx_conversations_low_time ON conversations(user_low_id,updated_at DESC,id DESC);
CREATE INDEX idx_conversations_high_time ON conversations(user_high_id,updated_at DESC,id DESC);

CREATE TABLE conversation_members(
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  last_read_message_id TEXT,
  last_read_at INTEGER,
  PRIMARY KEY(conversation_id,user_id)
);
CREATE INDEX idx_conversation_members_user ON conversation_members(user_id,conversation_id);

CREATE TABLE private_messages(
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  sender_user_id TEXT NOT NULL REFERENCES users(id),
  client_nonce TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  shared_object_type TEXT,
  shared_object_id TEXT,
  shared_url TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(sender_user_id,client_nonce)
);
CREATE INDEX idx_private_messages_conversation_time ON private_messages(conversation_id,created_at DESC,id DESC);

CREATE TABLE message_attachments(
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES private_messages(id),
  object_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_message_attachments_message ON message_attachments(message_id,id);

CREATE TABLE push_devices(
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN(0,1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_push_devices_user ON push_devices(user_id,enabled,updated_at DESC);

CREATE INDEX idx_users_username_friend_search ON users(username_norm,status,id);

INSERT OR IGNORE INTO schema_migrations(version,applied_at)
VALUES('0012_social_messaging_privacy',unixepoch()*1000);
