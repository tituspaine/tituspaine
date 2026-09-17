import type { Env } from '../types';
import type { IntelDatabase } from './types';
import { createTursoDatabase } from './turso';
import { RequestDbMetrics } from './metrics';

export interface RequestDatabase { db:IntelDatabase; metrics:RequestDbMetrics; provider:'turso'; }

/**
 * INTEL V3 production persistence is Turso/libSQL only.
 *
 * There is deliberately no D1 fallback here. A missing or invalid Turso
 * configuration must fail explicitly rather than silently routing production
 * traffic into a legacy database.
 */
export function databaseForRequest(env:Env):RequestDatabase {
  const metrics=new RequestDbMetrics();
  if(env.PERSISTENCE_PROVIDER !== 'turso') {
    throw new Error('INTEL persistence misconfigured: PERSISTENCE_PROVIDER must be turso');
  }
  const url=env.TURSO_PRODUCTION_DATABASE_URL;
  const token=env.TURSO_PRODUCTION_AUTH_TOKEN;
  if(!url || !token) {
    throw new Error('INTEL Turso production credentials are not configured');
  }
  return {db:createTursoDatabase(url,token,metrics),metrics,provider:'turso'};
}

export type { IntelDatabase,DbArgs,DbResult,DbStatement } from './types';
