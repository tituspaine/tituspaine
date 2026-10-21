import { describe, expect, it } from 'vitest';
import { FanoutRepository } from '../src/fanoutRepository';
import { memoryDatabase, seedInvestigation, seedUser } from './helpers/sqlite';

function fixture(count: number) {
  const fixture = memoryDatabase();
  const { sqlite } = fixture;
  seedInvestigation(sqlite, 'investigation');
  sqlite.exec("INSERT INTO investigation_updates(id,investigation_id,type,content,created_at,published_at) VALUES('update','investigation','UPDATE','Synthetic update',1,1)");
  sqlite.exec('BEGIN');
  for (let i = 0; i < count; i++) {
    const user = 'user-' + String(i).padStart(4, '0');
    seedUser(sqlite, user);
    sqlite.prepare("INSERT INTO investigation_follows(user_id,investigation_id,created_at) VALUES(?,'investigation',1)").run(user);
  }
  sqlite.exec('COMMIT');
  return fixture;
}

describe('bounded durable notification fanout', () => {
  it.each([800, 850])('completes %i followers across scheduler invocations without exhausting retries', async count => {
    const { sqlite, db } = fixture(count);
    try {
      const repo = new FanoutRepository(db);
      await repo.enqueue('investigation', 'update', undefined, 1);
      expect(await repo.drain(8, 100)).toEqual({ delivered: 800, completed: 0 });
      expect(await repo.drain(8, 100)).toEqual({ delivered: count - 800, completed: 1 });
      expect(sqlite.prepare('SELECT COUNT(*) n FROM notifications').get()?.n).toBe(count);
      expect(sqlite.prepare('SELECT status FROM notification_fanout_jobs').get()?.status).toBe('DONE');
      expect(await repo.drain(8, 100)).toEqual({ delivered: 0, completed: 0 });
    } finally { sqlite.close(); }
  });

  it('retains the bounded consecutive failure limit without advancing the cursor', async () => {
    const { sqlite, db } = fixture(20);
    try {
      const failingDb = { ...db, async batch() { throw new Error('Synthetic delivery failure'); } };
      const repo = new FanoutRepository(failingDb);
      await repo.enqueue('investigation', 'update', undefined, 1);
      expect(await repo.drain(8, 100)).toEqual({ delivered: 0, completed: 0 });
      const job = sqlite.prepare('SELECT attempts,status,cursor_user_id,last_error FROM notification_fanout_jobs').get();
      expect(job).toMatchObject({ attempts: 8, status: 'PENDING', cursor_user_id: null, last_error: 'Synthetic delivery failure' });
      expect(await repo.drain(8, 100)).toEqual({ delivered: 0, completed: 0 });
      expect(sqlite.prepare('SELECT COUNT(*) n FROM notifications').get()?.n).toBe(0);
    } finally { sqlite.close(); }
  });

  it('recovers from a transient error and excludes the publishing user', async () => {
    const { sqlite, db } = fixture(20);
    try {
      let failures = 1;
      const recoveringDb = { ...db, async batch(statements: Parameters<typeof db.batch>[0]) {
        if (failures-- > 0) throw new Error('Synthetic transient failure');
        return db.batch(statements);
      } };
      const repo = new FanoutRepository(recoveringDb);
      await repo.enqueue('investigation', 'update', 'user-0000', 1);
      expect(await repo.drain(2, 100)).toEqual({ delivered: 19, completed: 1 });
      expect(sqlite.prepare('SELECT attempts,last_error,status FROM notification_fanout_jobs').get()).toMatchObject({ attempts: 0, last_error: null, status: 'DONE' });
      expect(sqlite.prepare("SELECT COUNT(*) n FROM notifications WHERE user_id='user-0000'").get()?.n).toBe(0);
    } finally { sqlite.close(); }
  });
});
