export type DbPrimitive = string | number | null | Uint8Array;
export type DbArgs = DbPrimitive[];
export interface DbResult<T = Record<string, unknown>> { rows:T[]; rowsAffected:number; lastInsertRowid?:string|number; }
export interface DbStatement { sql:string; args?:DbArgs; }
/** Provider-neutral persistence contract. Provider SDKs must remain inside src/db. */
export interface IntelDatabase {
  execute<T = Record<string, unknown>>(sql:string,args?:DbArgs):Promise<DbResult<T>>;
  first<T = Record<string, unknown>>(sql:string,args?:DbArgs):Promise<T|null>;
  /** Atomic ordered batch. Use this for multi-statement writes that must succeed/fail together. */
  batch(statements:DbStatement[]):Promise<DbResult[]>;
}
