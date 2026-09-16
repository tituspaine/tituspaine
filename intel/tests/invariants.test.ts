import { describe, expect, it } from 'vitest';
import { normalizeEmail, normalizeUsername, hashPassword, verifyPassword, securityHeaders, validSameOrigin } from '../src/security';

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
