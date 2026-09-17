PRAGMA foreign_keys=ON;

-- SQLite cannot alter a CHECK constraint in place. Rebuild entities while preserving ids and FKs.
PRAGMA defer_foreign_keys=ON;
CREATE TABLE entities_v4(
 id TEXT PRIMARY KEY,
 type TEXT NOT NULL CHECK(type IN('PERSON','ORGANIZATION','BUSINESS','GOVERNMENT_BODY','PROPERTY','PARCEL','ADDRESS','LOCATION','CONTRACT','DOCUMENT','PUBLIC_RECORD','PROJECT')),
 canonical_name TEXT NOT NULL,
 normalized_name TEXT NOT NULL,
 description TEXT,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
INSERT INTO entities_v4(id,type,canonical_name,normalized_name,description,created_at,updated_at)
SELECT id,type,canonical_name,normalized_name,description,created_at,updated_at FROM entities;
DROP TABLE entities;
ALTER TABLE entities_v4 RENAME TO entities;
CREATE INDEX idx_entities_type_name ON entities(type,normalized_name,id);
CREATE INDEX idx_entities_name ON entities(normalized_name,id);

-- Recreate entity FTS triggers dropped with the old table.
CREATE TRIGGER entities_ai AFTER INSERT ON entities BEGIN
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body) VALUES('ENTITY',new.id,NULL,new.canonical_name,coalesce(new.description,''));
END;
CREATE TRIGGER entities_au AFTER UPDATE ON entities BEGIN
 DELETE FROM search_index WHERE object_type='ENTITY' AND object_id=old.id;
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body) VALUES('ENTITY',new.id,NULL,new.canonical_name,coalesce(new.description,''));
END;
CREATE TRIGGER entities_ad AFTER DELETE ON entities BEGIN DELETE FROM search_index WHERE object_type='ENTITY' AND object_id=old.id; END;

-- Search relationship assertions as first-class graph records. Entity names + assertion note
-- make relationship discovery deterministic without graph-wide scans.
CREATE TRIGGER relationships_ai AFTER INSERT ON entity_relationships BEGIN
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body)
 SELECT 'RELATIONSHIP',new.id,NULL,
        s.canonical_name||' '||replace(new.predicate,'_',' ')||' '||o.canonical_name,
        coalesce(new.assertion_note,'')
 FROM entities s,entities o WHERE s.id=new.subject_entity_id AND o.id=new.object_entity_id;
END;
CREATE TRIGGER relationships_au AFTER UPDATE ON entity_relationships BEGIN
 DELETE FROM search_index WHERE object_type='RELATIONSHIP' AND object_id=old.id;
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body)
 SELECT 'RELATIONSHIP',new.id,NULL,
        s.canonical_name||' '||replace(new.predicate,'_',' ')||' '||o.canonical_name,
        coalesce(new.assertion_note,'')
 FROM entities s,entities o WHERE s.id=new.subject_entity_id AND o.id=new.object_entity_id;
END;
CREATE TRIGGER relationships_ad AFTER DELETE ON entity_relationships BEGIN DELETE FROM search_index WHERE object_type='RELATIONSHIP' AND object_id=old.id; END;

-- Backfill relationships into FTS once, bounded to existing relationship rows.
INSERT INTO search_index(object_type,object_id,investigation_id,title,body)
SELECT 'RELATIONSHIP',r.id,NULL,s.canonical_name||' '||replace(r.predicate,'_',' ')||' '||o.canonical_name,coalesce(r.assertion_note,'')
FROM entity_relationships r JOIN entities s ON s.id=r.subject_entity_id JOIN entities o ON o.id=r.object_entity_id
WHERE NOT EXISTS(SELECT 1 FROM search_index x WHERE x.object_type='RELATIONSHIP' AND x.object_id=r.id);

INSERT OR IGNORE INTO schema_migrations(version,applied_at) VALUES('0004_entity_kinds_search',unixepoch()*1000);
