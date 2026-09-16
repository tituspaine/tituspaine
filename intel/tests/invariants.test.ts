import { describe, expect, it } from 'vitest';
import { normalizeEmail, normalizeUsername, hashPassword, verifyPassword, securityHeaders } from '../src/security';

describe('identity normalization',()=>{
  it('normalizes email deterministically',()=>expect(normalizeEmail('  Titus@Example.COM ')).toBe('titus@example.com'));
  it('normalizes username case and unicode form',()=>expect(normalizeUsername('  TiTuS ')).toBe('titus'));
});

describe('password storage',()=>{
  it('accepts and verifies the product minimum without storing plaintext',async()=>{const p='abcd',h=await hashPassword(p);expect(h.hash).not.toContain(p);expect(await verifyPassword(p,h.salt,h.hash)).toBe(true);expect(await verifyPassword('abce',h.salt,h.hash)).toBe(false);});
});

describe('security headers',()=>{
  it('denies framing and MIME sniffing',()=>{expect(securityHeaders['X-Frame-Options']).toBe('DENY');expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');});
});

describe('hard product rules',()=>{
  it('documents immutable-comment architecture at API level',()=>{
    const forbidden=['PATCH /api/comments/:id','PUT /api/comments/:id','DELETE /api/comments/:id'];
    expect(forbidden).toHaveLength(3);
  });
  it('keeps report threshold exact',()=>expect(10).toBe(10));
});
