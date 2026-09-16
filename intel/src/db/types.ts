export type DbPrimitive = string | number | null | Uint8Array;
export type DbArgs = DbPrimitive[];

export interface DbResult<T = Record<string, unknown>> {
  rows: T[];
  rowsAffected: number;
  lastInsertRowid?: string | number;
}

export interface DbStatement {
  sql: string;
  args?: DbArgs;
}

/** Provider-neutral persistence contract. Route/domain code must depend on this, not D1/libSQL. */
export interface IntelDatabase {
  execute<T = Record<string, unknown>>(sql: string, args?: DbArgs): Promise<DbResult<T>>;
  first<T = Record<string, unknown>>(sql: string, args?: DbArgs): Promise<T | null>;
  batch(statements: DbStatement[]): Promise<DbResult[]>;
  transaction<T>(work: (tx: IntelDatabase) => Promise<T>): Promise<T>;
}
