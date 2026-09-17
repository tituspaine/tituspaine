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
    /* Production cutover deliberately uses the separately provisioned and validated
       production credentials. Validation credentials remain isolated until retired. */
    const url=env.TURSO_PRODUCTION_DATABASE_URL;
    const token=env.TURSO_PRODUCTION_AUTH_TOKEN;
    if(!url || !token) throw new Error('Turso persistence selected but production credentials are not configured');
    return {db:createTursoDatabase(url,token,metrics),metrics,provider};
  }
  if(!env.DB) throw new Error('Legacy D1 persistence is not configured');
  return {db:createD1Database(env.DB,metrics),metrics,provider};
}
export type { IntelDatabase,DbArgs,DbResult,DbStatement } from './types';
