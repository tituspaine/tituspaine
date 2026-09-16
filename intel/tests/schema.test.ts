import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';

const core=readFileSync(new URL('../migrations/0001_core.sql',import.meta.url),'utf8');
const search=readFileSync(new URL('../migrations/0002_search_roles.sql',import.meta.url),'utf8');

describe('database invariants',()=>{
 it('has no user-editable comment update/delete trigger or revision table',()=>{
   expect(core).toContain('CREATE TABLE comments');
   expect(core).not.toMatch(/comment_revisions|edited_at/i);
 });
 it('enforces one same-category report per account/comment',()=>expect(core).toContain('UNIQUE(comment_id, reporter_user_id, category)'));
 it('indexes threshold evaluation',()=>expect(core).toContain('idx_reports_threshold'));
 it('uses FTS for production corpus search',()=>expect(search).toContain('CREATE VIRTUAL TABLE search_index USING fts5'));
 it('keeps admin capability in server-side data model',()=>expect(search).toContain("role IN ('ADMIN','MODERATOR','PUBLISHER')"));
});
