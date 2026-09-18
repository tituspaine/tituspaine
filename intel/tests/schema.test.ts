import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';

const core=readFileSync(new URL('../migrations-turso/0001_core.sql',import.meta.url),'utf8');
const search=readFileSync(new URL('../migrations-turso/0002_search.sql',import.meta.url),'utf8');
const scaling=readFileSync(new URL('../migrations-turso/0009_post_thread_scaling.sql',import.meta.url),'utf8');
const hot=readFileSync(new URL('../migrations-turso/0010_hot_path_indexes.sql',import.meta.url),'utf8');
const community=readFileSync(new URL('../migrations-turso/0011_claims_feeds_moderation.sql',import.meta.url),'utf8');
const socialNotifications=readFileSync(new URL('../migrations-turso/0013_social_notification_preferences.sql',import.meta.url),'utf8');
const fanout=readFileSync(new URL('../migrations-turso/0014_notification_fanout_outbox.sql',import.meta.url),'utf8');

describe('V3 production database invariants',()=>{
 it('makes published comments immutable',()=>{expect(core).toContain('CREATE TRIGGER comments_no_content_update');expect(core).toContain('CREATE TRIGGER comments_no_delete');});
 it('caps reply depth in the database',()=>expect(core).toContain('CHECK(depth BETWEEN 0 AND 8)'));
 it('enforces one same-category report per account/comment',()=>expect(core).toContain('UNIQUE(comment_id,reporter_user_id,category)'));
 it('indexes report threshold evaluation',()=>expect(core).toContain('idx_reports_threshold'));
 it('keeps roles server-side',()=>expect(core).toContain("role IN('ADMIN','MODERATOR','PUBLISHER')"));
 it('uses FTS5 for the production corpus',()=>expect(search).toContain('CREATE VIRTUAL TABLE search_index USING fts5'));
 it('indexes root and parent thread reads for bounded post pages',()=>{expect(scaling).toContain('idx_comments_root_time');expect(scaling).toContain('idx_comments_parent_time');expect(scaling).toContain('idx_comments_investigation_root_rank');});
 it('indexes high-growth user and follower hot paths',()=>{for(const name of ['idx_notifications_user_time','idx_investigation_follows_investigation_user','idx_comments_author_time','idx_evidence_creator_time','idx_investigations_public_updated'])expect(hot).toContain(name);});
 it('separates claims, evidence support, custom feeds and moderation state',()=>{for(const table of ['claims','claim_evidence','custom_feeds','custom_feed_investigations','content_moderation_state'])expect(community).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);expect(community).toContain('idx_comments_post_best');});
 it('indexes social notification preferences and unread reads',()=>{expect(socialNotifications).toContain('CREATE TABLE social_notification_preferences');expect(socialNotifications).toContain('idx_notifications_user_unread_time');});
 it('persists resumable follower fanout jobs',()=>{expect(fanout).toContain('CREATE TABLE notification_fanout_jobs');expect(fanout).toContain('UNIQUE(investigation_id,update_id)');expect(fanout).toContain('idx_notification_fanout_jobs_status');});
 it('keeps entity search one row per entity',()=>{expect(search).toContain("SELECT 'ENTITY',e.id,NULL");expect(search).not.toContain("SELECT 'ENTITY',e.id,ie.investigation_id");});
 it('synchronizes mutable searchable objects',()=>{expect(search).toContain('CREATE TRIGGER search_update_update');expect(search).toContain('CREATE TRIGGER search_evidence_update');expect(search).toContain('CREATE TRIGGER search_alias_delete');});
});
