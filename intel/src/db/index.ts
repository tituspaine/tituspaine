import type { Env } from '../types';
import type { IntelDatabase } from './types';
import { createD1Database } from './d1';
import { createTursoDatabase } from './turso';
import { RequestDbMetrics } from './metrics';

export interface RequestDatabase { db:IntelDatabase; metrics:RequestDbMetrics; provider:'d1'|'turso'; }
export function databaseForRequest(env:Env):RequestDatabase {
  const metrics=new RequestDbMetrics();
  const provider=env.PERSISTENCE_PROVIDER==='turso'?'turso':'d1';
  if(provider==='turso'){
    if(!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) throw new Error('Turso persistence selected but credentials are not configured');
    return {db:createTursoDatabase(env.TURSO_DATABASE_URL,env.TURSO_AUTH_TOKEN,metrics),metrics,provider};
  }
  if(!env.DB) throw new Error('Legacy D1 persistence is not configured');
  return {db:createD1Database(env.DB,metrics),metrics,provider};
}
export type { IntelDatabase,DbArgs,DbResult,DbStatement } from './types';
