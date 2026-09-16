PRAGMA foreign_keys = ON;

CREATE TABLE users (
 id TEXT PRIMARY KEY, email_norm TEXT NOT NULL UNIQUE, username TEXT NOT NULL, username_norm TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','DEACTIVATED','SUSPENDED')),
 created_at INTEGER NOT NULL, deactivated_at INTEGER, last_seen_at INTEGER
);
CREATE TABLE user_credentials (
 user_id TEXT PRIMARY KEY REFERENCES users(id), password_hash TEXT NOT NULL, password_salt TEXT NOT NULL,
 kdf TEXT NOT NULL, kdf_params TEXT NOT NULL, updated_at INTEGER NOT NULL
);
CREATE TABLE sessions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), token_hash TEXT NOT NULL UNIQUE,
 created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, revoked_at INTEGER, last_seen_at INTEGER
);
CREATE INDEX idx_sessions_user_active ON sessions(user_id, revoked_at, expires_at);

CREATE TABLE investigations (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL CHECK(status IN ('ACTIVE','DEVELOPING','DOCUMENTING','AWAITING_RECORDS','ARCHIVED','CLOSED')),
 author_user_id TEXT REFERENCES users(id), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
 published_at INTEGER, update_count INTEGER NOT NULL DEFAULT 0, comment_count INTEGER NOT NULL DEFAULT 0,
 follower_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_investigations_feed ON investigations(published_at DESC, updated_at DESC, id);

CREATE TABLE investigation_updates (
 id TEXT PRIMARY KEY, investigation_id TEXT NOT NULL REFERENCES investigations(id),
 type TEXT NOT NULL CHECK(type IN ('UPDATE','FINDING','EVIDENCE','PUBLIC_RECORD','DOCUMENT','SOURCE','TIMELINE_EVENT','BACKGROUND','QUESTION','CORRECTION','DATA','CONNECTION')),
 title TEXT, content TEXT NOT NULL, author_user_id TEXT REFERENCES users(id), created_at INTEGER NOT NULL,
 published_at INTEGER NOT NULL, pinned INTEGER NOT NULL DEFAULT 0 CHECK(pinned IN (0,1)), like_count INTEGER NOT NULL DEFAULT 0,
 comment_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_updates_investigation_time ON investigation_updates(investigation_id, published_at DESC, id);

CREATE TABLE investigation_follows (
 user_id TEXT NOT NULL REFERENCES users(id), investigation_id TEXT NOT NULL REFERENCES investigations(id), created_at INTEGER NOT NULL,
 PRIMARY KEY(user_id, investigation_id)
);
CREATE TABLE investigation_read_state (
 user_id TEXT NOT NULL REFERENCES users(id), investigation_id TEXT NOT NULL REFERENCES investigations(id),
 last_seen_update_at INTEGER, last_seen_update_id TEXT, updated_at INTEGER NOT NULL,
 PRIMARY KEY(user_id, investigation_id)
);

CREATE TABLE sources (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, source_type TEXT, organization TEXT, url TEXT, record_date INTEGER,
 obtained_at INTEGER, verification_state TEXT CHECK(verification_state IN ('PRIMARY_SOURCE','PUBLIC_RECORD','VERIFIED','SECONDARY_SOURCE','UNVERIFIED','DISPUTED')),
 created_by TEXT REFERENCES users(id), created_at INTEGER NOT NULL
);
CREATE TABLE evidence (
 id TEXT PRIMARY KEY, investigation_id TEXT NOT NULL REFERENCES investigations(id), title TEXT NOT NULL, description TEXT,
 source_id TEXT REFERENCES sources(id), verification_state TEXT CHECK(verification_state IN ('PRIMARY_SOURCE','PUBLIC_RECORD','VERIFIED','SECONDARY_SOURCE','UNVERIFIED','DISPUTED')),
 created_by TEXT REFERENCES users(id), created_at INTEGER NOT NULL
);
CREATE INDEX idx_evidence_investigation ON evidence(investigation_id, created_at DESC);
CREATE TABLE attachments (
 id TEXT PRIMARY KEY, evidence_id TEXT REFERENCES evidence(id), update_id TEXT REFERENCES investigation_updates(id),
 object_key TEXT NOT NULL UNIQUE, original_filename TEXT NOT NULL, mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL,
 sha256 TEXT NOT NULL, uploaded_by TEXT REFERENCES users(id), uploaded_at INTEGER NOT NULL, version_of_id TEXT REFERENCES attachments(id)
);

CREATE TABLE entities (
 id TEXT PRIMARY KEY, type TEXT NOT NULL CHECK(type IN ('PERSON','ORGANIZATION','BUSINESS','GOVERNMENT_BODY','PROPERTY','PARCEL','CONTRACT','DOCUMENT','PROJECT')),
 canonical_name TEXT NOT NULL, normalized_name TEXT NOT NULL, description TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX idx_entities_name ON entities(normalized_name, type);
CREATE TABLE entity_aliases (
 id TEXT PRIMARY KEY, entity_id TEXT NOT NULL REFERENCES entities(id), alias TEXT NOT NULL, normalized_alias TEXT NOT NULL,
 UNIQUE(entity_id, normalized_alias)
);
CREATE INDEX idx_entity_alias_lookup ON entity_aliases(normalized_alias);
CREATE TABLE entity_relationships (
 id TEXT PRIMARY KEY, subject_entity_id TEXT NOT NULL REFERENCES entities(id), predicate TEXT NOT NULL,
 object_entity_id TEXT NOT NULL REFERENCES entities(id), source_id TEXT REFERENCES sources(id), evidence_id TEXT REFERENCES evidence(id),
 valid_from INTEGER, valid_to INTEGER, created_by TEXT REFERENCES users(id), created_at INTEGER NOT NULL
);
CREATE INDEX idx_relationship_subject ON entity_relationships(subject_entity_id, predicate);
CREATE INDEX idx_relationship_object ON entity_relationships(object_entity_id, predicate);
CREATE TABLE investigation_entities (
 investigation_id TEXT NOT NULL REFERENCES investigations(id), entity_id TEXT NOT NULL REFERENCES entities(id), role TEXT,
 PRIMARY KEY(investigation_id, entity_id)
);

CREATE TABLE comments (
 id TEXT PRIMARY KEY, investigation_id TEXT NOT NULL REFERENCES investigations(id), update_id TEXT REFERENCES investigation_updates(id),
 parent_id TEXT REFERENCES comments(id), root_id TEXT REFERENCES comments(id), depth INTEGER NOT NULL DEFAULT 0,
 author_user_id TEXT NOT NULL REFERENCES users(id), content TEXT NOT NULL,
 visibility_status TEXT NOT NULL DEFAULT 'VISIBLE' CHECK(visibility_status IN ('VISIBLE','AUTO_HIDDEN','MOD_REMOVED')),
 created_at INTEGER NOT NULL, like_count INTEGER NOT NULL DEFAULT 0, reply_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_comments_thread ON comments(investigation_id, root_id, created_at, id);
CREATE INDEX idx_comments_parent ON comments(parent_id, created_at, id);
CREATE TABLE comment_likes (user_id TEXT NOT NULL REFERENCES users(id), comment_id TEXT NOT NULL REFERENCES comments(id), created_at INTEGER NOT NULL, PRIMARY KEY(user_id, comment_id));
CREATE TABLE update_likes (user_id TEXT NOT NULL REFERENCES users(id), update_id TEXT NOT NULL REFERENCES investigation_updates(id), created_at INTEGER NOT NULL, PRIMARY KEY(user_id, update_id));

CREATE TABLE comment_reports (
 id TEXT PRIMARY KEY, comment_id TEXT NOT NULL REFERENCES comments(id), reporter_user_id TEXT NOT NULL REFERENCES users(id),
 category TEXT NOT NULL CHECK(category IN ('SPAM','HARASSMENT','THREAT','PERSONAL_INFORMATION','IMPERSONATION','MISLEADING_FALSE_CONTENT','OTHER')),
 status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','REVIEWED','DISMISSED','ACTIONED')),
 eligible INTEGER NOT NULL DEFAULT 1 CHECK(eligible IN (0,1)), created_at INTEGER NOT NULL,
 UNIQUE(comment_id, reporter_user_id, category)
);
CREATE INDEX idx_reports_threshold ON comment_reports(comment_id, category, eligible, status);
CREATE TABLE moderation_queue (
 id TEXT PRIMARY KEY, comment_id TEXT NOT NULL REFERENCES comments(id), trigger_category TEXT, trigger_count INTEGER,
 status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','CONFIRMED','RESTORED','DISMISSED')),
 created_at INTEGER NOT NULL, resolved_at INTEGER, resolved_by TEXT REFERENCES users(id)
);
CREATE TABLE moderation_actions (
 id TEXT PRIMARY KEY, comment_id TEXT REFERENCES comments(id), target_user_id TEXT REFERENCES users(id), moderator_user_id TEXT REFERENCES users(id),
 action TEXT NOT NULL, reason TEXT, created_at INTEGER NOT NULL
);

CREATE TABLE notifications (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), type TEXT NOT NULL, investigation_id TEXT REFERENCES investigations(id),
 comment_id TEXT REFERENCES comments(id), update_id TEXT REFERENCES investigation_updates(id), payload_json TEXT,
 created_at INTEGER NOT NULL, read_at INTEGER
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at, created_at DESC);
CREATE TABLE push_subscriptions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
 categories_json TEXT NOT NULL, created_at INTEGER NOT NULL, revoked_at INTEGER
);

CREATE TABLE corrections (
 id TEXT PRIMARY KEY, investigation_id TEXT NOT NULL REFERENCES investigations(id), original_update_id TEXT REFERENCES investigation_updates(id),
 corrected_update_id TEXT REFERENCES investigation_updates(id), original_content TEXT NOT NULL, corrected_content TEXT NOT NULL,
 reason TEXT NOT NULL, author_user_id TEXT REFERENCES users(id), created_at INTEGER NOT NULL
);
CREATE TABLE tags (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, normalized_name TEXT NOT NULL UNIQUE);
CREATE TABLE investigation_tags (investigation_id TEXT NOT NULL REFERENCES investigations(id), tag_id TEXT NOT NULL REFERENCES tags(id), PRIMARY KEY(investigation_id, tag_id));

CREATE TABLE audit_events (
 id TEXT PRIMARY KEY, actor_user_id TEXT REFERENCES users(id), event_type TEXT NOT NULL, object_type TEXT NOT NULL, object_id TEXT NOT NULL,
 payload_json TEXT, created_at INTEGER NOT NULL
);
CREATE INDEX idx_audit_object ON audit_events(object_type, object_id, created_at, id);
CREATE INDEX idx_audit_time ON audit_events(created_at DESC, id);
