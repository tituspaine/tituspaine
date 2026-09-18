import {describe,it,expect} from 'vitest';import fs from 'node:fs';
const read=(p:string)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
describe('INTEL social architecture contracts',()=>{
 const migration=read('migrations-turso/0012_social_messaging_privacy.sql'),routes=read('src/socialRoutes.ts'),repo=read('src/socialRepository.ts'),auth=read('src/authRoutes.ts'),views=read('src/views.ts');
 it('uses canonical mutual friendship and indexed bounded messaging',()=>{expect(migration).toContain('PRIMARY KEY(user_low_id,user_high_id)');expect(migration).toContain('idx_private_messages_conversation_time');expect(repo).toContain("status!=='FRIENDS'");expect(repo).toContain('LIMIT ?');});
 it('keeps private media in R2 behind conversation authorization',()=>{expect(routes).toContain('c.env.EVIDENCE.put');expect(routes).toContain('messageAttachment');expect(routes).toContain('repo(c).member(conversationId,c.user!.id)');});
 it('enforces private DOB and explicit signup choices',()=>{expect(auth).toContain('date_of_birth');expect(auth).toContain('You must be at least 18 years old');expect(auth).toContain("accept_policies!=='yes'");expect(auth).toContain("accept_notifications!=='yes'");expect(auth).toContain("accept_cookies!=='yes'");expect(migration).toContain('date_of_birth TEXT');});
 it('replaces Latest primary nav with Messages while preserving home sorting',()=>{expect(views).not.toContain('href="/latest" aria-label="Latest"');expect(views).toContain('href="/messages" aria-label="Messages"');});
 it('uses mobile viewport-stable chat and keyset cursors',()=>{expect(routes).toContain('chat-transcript');expect(routes).toContain('client_nonce');expect(repo).toContain('m.created_at<?');expect(views).toContain('--vvh');});
 it('centralizes profile activity privacy',()=>{expect(migration).toContain("profile_visibility TEXT NOT NULL DEFAULT 'PUBLIC'");expect(repo).toContain("u.profile_visibility==='FRIENDS'");expect(repo).toContain("u.profile_visibility==='PUBLIC'");});
});
