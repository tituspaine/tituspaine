PRAGMA foreign_keys=ON;

-- Phase 5: traceable, temporal intelligence graph. Existing source_id/evidence_id columns
-- remain compatible; junction tables allow multiple independent supports per assertion.
ALTER TABLE entity_relationships ADD COLUMN confidence REAL NOT NULL DEFAULT 0.5 CHECK(confidence>=0 AND confidence<=1);
ALTER TABLE entity_relationships ADD COLUMN verification_state TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK(verification_state IN('PRIMARY_SOURCE','PUBLIC_RECORD','VERIFIED','SECONDARY_SOURCE','UNVERIFIED','DISPUTED'));
ALTER TABLE entity_relationships ADD COLUMN observed_at INTEGER;
ALTER TABLE entity_relationships ADD COLUMN assertion_note TEXT;
ALTER TABLE entity_relationships ADD COLUMN supersedes_relationship_id TEXT REFERENCES entity_relationships(id);

CREATE INDEX idx_relationship_temporal_subject ON entity_relationships(subject_entity_id,predicate,valid_from DESC,valid_to,id);
CREATE INDEX idx_relationship_temporal_object ON entity_relationships(object_entity_id,predicate,valid_from DESC,valid_to,id);
CREATE INDEX idx_relationship_verification ON entity_relationships(verification_state,confidence DESC,created_at DESC,id);

CREATE TABLE relationship_evidence(
  relationship_id TEXT NOT NULL REFERENCES entity_relationships(id),
  evidence_id TEXT NOT NULL REFERENCES evidence(id),
  support_type TEXT NOT NULL DEFAULT 'SUPPORTS' CHECK(support_type IN('SUPPORTS','CONTRADICTS','CONTEXT')),
  assertion_note TEXT,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(relationship_id,evidence_id,support_type)
);
CREATE INDEX idx_relationship_evidence_evidence ON relationship_evidence(evidence_id,relationship_id);

CREATE TABLE relationship_sources(
  relationship_id TEXT NOT NULL REFERENCES entity_relationships(id),
  source_id TEXT NOT NULL REFERENCES sources(id),
  support_type TEXT NOT NULL DEFAULT 'SUPPORTS' CHECK(support_type IN('SUPPORTS','CONTRADICTS','CONTEXT')),
  assertion_note TEXT,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(relationship_id,source_id,support_type)
);
CREATE INDEX idx_relationship_sources_source ON relationship_sources(source_id,relationship_id);

-- Preserve provenance already stored in the legacy single-value columns.
INSERT OR IGNORE INTO relationship_evidence(relationship_id,evidence_id,support_type,created_by,created_at)
SELECT id,evidence_id,'SUPPORTS',created_by,created_at FROM entity_relationships WHERE evidence_id IS NOT NULL;
INSERT OR IGNORE INTO relationship_sources(relationship_id,source_id,support_type,created_by,created_at)
SELECT id,source_id,'SUPPORTS',created_by,created_at FROM entity_relationships WHERE source_id IS NOT NULL;

CREATE TABLE entity_resolution_candidates(
  id TEXT PRIMARY KEY,
  left_entity_id TEXT NOT NULL REFERENCES entities(id),
  right_entity_id TEXT NOT NULL REFERENCES entities(id),
  score REAL NOT NULL CHECK(score>=0 AND score<=1),
  reasons_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN('PENDING','MATCH','NOT_MATCH','MERGED')),
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  reviewed_by TEXT REFERENCES users(id),
  CHECK(left_entity_id<>right_entity_id),
  UNIQUE(left_entity_id,right_entity_id)
);
CREATE INDEX idx_resolution_pending ON entity_resolution_candidates(status,score DESC,created_at,id);

CREATE TABLE entity_merge_history(
  id TEXT PRIMARY KEY,
  surviving_entity_id TEXT NOT NULL REFERENCES entities(id),
  merged_entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_json TEXT,
  merged_by TEXT REFERENCES users(id),
  merged_at INTEGER NOT NULL,
  CHECK(surviving_entity_id<>merged_entity_id)
);
CREATE INDEX idx_entity_merge_survivor ON entity_merge_history(surviving_entity_id,merged_at DESC,id);

INSERT OR IGNORE INTO schema_migrations(version,applied_at) VALUES('0003_graph_provenance',unixepoch()*1000);
