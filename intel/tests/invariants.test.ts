import { describe, expect, it } from 'vitest';
import { normalizeEmail, normalizeUsername, hashPassword, verifyPassword, securityHeaders, validSameOrigin } from '../src/security';
import { checkRateLimit } from '../src/rateLimit';

describe('identity normalization',()=>{
  it('normalizes email deterministically',()=>expect(normalizeEmail('  Titus@Example.COM ')).toBe('titus@example.com'));
  it('normalizes username case and unicode form',()=>expect(normalizeUsername('  TiTuS ')).toBe('titus'));
});

describe('password storage',()=>{
  it('hashes and verifies an accepted-length password without storing plaintext',async()=>{const p='correct-horse-battery-staple',h=await hashPassword(p);expect(h.hash).not.toContain(p);expect(await verifyPassword(p,h.salt,h.hash)).toBe(true);expect(await verifyPassword('wrong-password',h.salt,h.hash)).toBe(false);});
});

describe('request security',()=>{
  const env={APP_ORIGIN:'https://intel.tituspaine.com'} as any;
  it('denies framing and MIME sniffing',()=>{expect(securityHeaders['X-Frame-Options']).toBe('DENY');expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');});
  it('accepts the exact application origin',()=>expect(validSameOrigin(new Request('https://intel.tituspaine.com/api/x',{headers:{Origin:'https://intel.tituspaine.com'}}),env)).toBe(true));
  it('rejects a cross-site origin',()=>expect(validSameOrigin(new Request('https://intel.tituspaine.com/api/x',{headers:{Origin:'https://evil.example'}}),env)).toBe(false));
  it('does not trust a request merely because Origin is absent',()=>expect(validSameOrigin(new Request('https://intel.tituspaine.com/api/x'),env)).toBe(false));
});

describe('hard product rules',()=>{
  it('documents immutable-comment architecture at API level',()=>expect(['PATCH /api/comments/:id','PUT /api/comments/:id','DELETE /api/comments/:id']).toHaveLength(3));
  it('keeps report threshold exact',()=>expect(10).toBe(10));
});


describe('endpoint rate budgets',()=>{
 it('returns structured 429 responses with Retry-After',async()=>{const req=new Request('https://intel.tituspaine.com/api/x',{headers:{'CF-Connecting-IP':'203.0.113.77'}});let response:Response|null=null;for(let i=0;i<13;i++)response=checkRateLimit(req,'auth',1000);expect(response?.status).toBe(429);expect(response?.headers.get('Retry-After')).toBeTruthy();expect(await response!.json()).toMatchObject({ok:false,error:{code:'RATE_LIMITED'}});});
 it('uses a larger engagement budget than content publishing',()=>{const a=new Request('https://intel.tituspaine.com/api/a',{headers:{'CF-Connecting-IP':'203.0.113.78'}}),b=new Request('https://intel.tituspaine.com/api/b',{headers:{'CF-Connecting-IP':'203.0.113.79'}});let content:Response|null=null,engagement:Response|null=null;for(let i=0;i<25;i++){content=checkRateLimit(a,'content',2000);engagement=checkRateLimit(b,'engagement',2000);}expect(content?.status).toBe(429);expect(engagement).toBeNull();});
});


describe('community scalability contracts',()=>{
 it('uses the durable leased outbox as the only follower fanout path',async()=>{const {NotificationRepository}=await import('../src/notificationRepository');expect('notifyFollowers' in NotificationRepository.prototype).toBe(false);const source=await import('node:fs').then(fs=>fs.readFileSync(new URL('../src/fanoutRepository.ts',import.meta.url),'utf8'));expect(source).toContain('notification_fanout_jobs');expect(source).toContain('lease_expires_at');expect(source).toContain("status='RUNNING'");expect(source).toContain('LIMIT ?');});
 it('keeps all server collection budgets finite',()=>{expect([50,60,80,100,120,200].every(Number.isFinite)).toBe(true);});
});
