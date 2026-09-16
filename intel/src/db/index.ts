import type { Env } from '../types';
import type { IntelDatabase } from './types';
import { createTursoDatabase } from './turso';
import { RequestDbMetrics } from './metrics';

export interface RequestDatabase { db:IntelDatabase; metrics:RequestDbMetrics; }
export function databaseForRequest(env:Env):RequestDatabase {
  if(!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) throw new Error('INTEL database is not configured');
  const metrics=new RequestDbMetrics();
  return {db:createTursoDatabase(env.TURSO_DATABASE_URL,env.TURSO_AUTH_TOKEN,metrics),metrics};
}
export type { IntelDatabase,DbArgs,DbResult,DbStatement } from './types';
