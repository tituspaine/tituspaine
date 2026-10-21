import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import type { DbArgs, DbResult, DbStatement, IntelDatabase } from '../../src/db/types';

/** Isolated schema fixture: never reads credentials or connects to production. */
export function memoryDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys=ON');
  const dir = new URL('../../migrations-turso/', import.meta.url);
  for (const file of readdirSync(dir).filter(x => x.endsWith('.sql')).sort()) {
    sqlite.exec(readFileSync(new URL(file, dir), 'utf8'));
  }
  const execute = async <T>(sql: string, args: DbArgs = []): Promise<DbResult<T>> => {
    const statement = sqlite.prepare(sql);
    if (statement.columns().length) return { rows: statement.all(...args) as T[], rowsAffected: 0 };
    const result = statement.run(...args);
    return { rows: [], rowsAffected: Number(result.changes), lastInsertRowid: Number(result.lastInsertRowid) };
  };
  const db: IntelDatabase = {
    execute,
    async first<T>(sql: string, args: DbArgs = []) { return (await execute<T>(sql, args)).rows[0] ?? null; },
    async batch(statements: DbStatement[]) {
      sqlite.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await execute(statement.sql, statement.args));
        sqlite.exec('COMMIT');
        return results;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    }
  };
  return { sqlite, db };
}

export function seedInvestigation(sqlite: DatabaseSync, id: string, published = true) {
  sqlite.prepare("INSERT INTO investigations(id,slug,title,status,created_at,updated_at,published_at) VALUES(?,?,?,'ACTIVE',1,1,?)")
    .run(id, id, `Synthetic ${id}`, published ? 1 : null);
}

export function seedUser(sqlite: DatabaseSync, id: string) {
  sqlite.prepare('INSERT INTO users(id,email_norm,username,username_norm,created_at) VALUES(?,?,?,?,1)')
    .run(id, `${id}@example.invalid`, id, id);
}
