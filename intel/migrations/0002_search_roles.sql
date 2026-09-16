PRAGMA foreign_keys = ON;

CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK(role IN ('ADMIN','MODERATOR','PUBLISHER')),
  granted_at INTEGER NOT NULL,
  granted_by TEXT REFERENCES users(id),
  PRIMARY KEY(user_id, role)
);
CREATE INDEX idx_user_roles_role ON user_roles(role, user_id);

CREATE VIRTUAL TABLE search_index USING fts5(
  object_type UNINDEXED,
  object_id UNINDEXED,
  investigation_id UNINDEXED,
  title,
  body,
  aliases,
  tokenize='unicode61 remove_diacritics 2'
);

INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases)
SELECT 'INVESTIGATION',id,id,title,summary,'' FROM investigations WHERE published_at IS NOT NULL;
INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases)
SELECT 'UPDATE',id,investigation_id,COALESCE(title,''),content,type FROM investigation_updates;
INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases)
SELECT 'EVIDENCE',id,investigation_id,title,COALESCE(description,''),verification_state FROM evidence;
INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases)
SELECT 'ENTITY',e.id,ie.investigation_id,e.canonical_name,COALESCE(e.description,''),COALESCE((SELECT group_concat(alias,' ') FROM entity_aliases a WHERE a.entity_id=e.id),'')
FROM entities e LEFT JOIN investigation_entities ie ON ie.entity_id=e.id;

CREATE TRIGGER search_investigation_insert AFTER INSERT ON investigations WHEN new.published_at IS NOT NULL BEGIN
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases) VALUES('INVESTIGATION',new.id,new.id,new.title,new.summary,'');
END;
CREATE TRIGGER search_investigation_update AFTER UPDATE OF title,summary,published_at ON investigations BEGIN
 DELETE FROM search_index WHERE object_type='INVESTIGATION' AND object_id=old.id;
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases) SELECT 'INVESTIGATION',new.id,new.id,new.title,new.summary,'' WHERE new.published_at IS NOT NULL;
END;
CREATE TRIGGER search_update_insert AFTER INSERT ON investigation_updates BEGIN
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases) VALUES('UPDATE',new.id,new.investigation_id,COALESCE(new.title,''),new.content,new.type);
END;
CREATE TRIGGER search_evidence_insert AFTER INSERT ON evidence BEGIN
 INSERT INTO search_index(object_type,object_id,investigation_id,title,body,aliases) VALUES('EVIDENCE',new.id,new.investigation_id,new.title,COALESCE(new.description,''),new.verification_state);
END;
