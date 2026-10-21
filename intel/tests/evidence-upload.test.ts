import { describe, expect, it } from 'vitest';
import { uploadEvidence } from '../src/adminEvidence';
import type { RequestContext } from '../src/types';
import { memoryDatabase, seedInvestigation, seedUser } from './helpers/sqlite';

describe('community evidence upload behavior', () => {
  it('stores signature-normalized content in mocked R2 and cannot self-verify evidence', async () => {
    const { sqlite, db } = memoryDatabase();
    try {
      seedInvestigation(sqlite, 'investigation');
      seedUser(sqlite, 'contributor');
      const uploads: { key: string; bytes: ArrayBuffer; options: any }[] = [];
      const body = new FormData();
      body.set('title', 'Synthetic evidence');
      body.set('verification_state', 'VERIFIED');
      body.set('file', new File(['%PDF-1.7\nsynthetic fixture'], 'fixture.pdf', { type: 'application/pdf' }));
      const request = new Request('https://example.invalid/api/investigations/investigation/evidence', { method: 'POST', headers: { Origin: 'https://example.invalid' }, body });
      const context = { request, url: new URL(request.url), db, user: { id: 'contributor', username: 'contributor', status: 'ACTIVE', isAdmin: false }, env: { APP_ORIGIN: 'https://example.invalid', EVIDENCE: { async put(key: string, bytes: ArrayBuffer, options: any) { uploads.push({ key, bytes, options }); }, async delete() { throw new Error('Unexpected cleanup'); } } } } as unknown as RequestContext;
      const response = await uploadEvidence(context, 'investigation', true);
      expect(response.status).toBe(303);
      expect(uploads).toHaveLength(1);
      expect(uploads[0].options.httpMetadata.contentType).toBe('application/pdf');
      expect(uploads[0].options.customMetadata.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(sqlite.prepare('SELECT verification_state FROM evidence').get()?.verification_state).toBe('UNVERIFIED');
      expect(sqlite.prepare('SELECT object_key,mime_type FROM attachments').get()).toMatchObject({ object_key: uploads[0].key, mime_type: 'application/pdf' });
    } finally { sqlite.close(); }
  });
});
