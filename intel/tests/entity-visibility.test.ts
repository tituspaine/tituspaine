import { describe, expect, it } from 'vitest';
import { EntityRepository } from '../src/entityRepository';
import { memoryDatabase, seedInvestigation } from './helpers/sqlite';

describe('public entity evidence visibility', () => {
  it('excludes draft evidence through every association while retaining published evidence', async () => {
    const { sqlite, db } = memoryDatabase();
    try {
      seedInvestigation(sqlite, 'published');
      seedInvestigation(sqlite, 'draft', false);
      for (const id of ['entity', 'other']) sqlite.prepare("INSERT INTO entities(id,type,canonical_name,normalized_name,created_at,updated_at) VALUES(?,'PERSON',?,?,1,1)").run(id, id, id);
      sqlite.exec("INSERT INTO investigation_entities VALUES('published','entity',NULL),('draft','entity',NULL)");
      for (const [id, investigation] of [['public-evidence', 'published'], ['draft-evidence', 'draft']]) {
        sqlite.prepare("INSERT INTO evidence(id,investigation_id,title,verification_state,created_at) VALUES(?,?,?,'UNVERIFIED',1)").run(id, investigation, `Synthetic ${id}`);
      }
      sqlite.exec("INSERT INTO entity_relationships(id,subject_entity_id,predicate,object_entity_id,evidence_id,created_at) VALUES('relationship','entity','RELATED_TO','other','draft-evidence',1)");
      sqlite.exec("INSERT INTO relationship_evidence(relationship_id,evidence_id,support_type,created_at) VALUES('relationship','draft-evidence','SUPPORTS',1)");
      const repo = new EntityRepository(db);
      expect((await repo.evidence('entity')).rows.map(row => row.id)).toEqual(['public-evidence']);
      // The reverse relationship path must not expose the draft either.
      expect((await repo.evidence('other')).rows).toEqual([]);
      sqlite.exec("UPDATE investigations SET published_at=NULL WHERE id='published'");
      expect((await repo.evidence('entity')).rows).toEqual([]);
    } finally { sqlite.close(); }
  });
});
