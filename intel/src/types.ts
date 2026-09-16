import type { IntelDatabase } from './db/types';

export interface Env {
  /** Temporary legacy binding. Remove at the Turso production cutover. */
  DB: D1Database;
  EVIDENCE: R2Bucket;
  APP_ORIGIN: string;
  ENVIRONMENT: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  SESSION_PEPPER: string;
  ADMIN_USER_IDS?: string;
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}

export interface SessionUser {
  id: string;
  username: string;
  status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED';
  isAdmin: boolean;
}

export interface RequestContext {
  request: Request;
  env: Env;
  url: URL;
  user: SessionUser | null;
  /** V3 provider-neutral persistence handle; populated as routes migrate. */
  db?: IntelDatabase;
}
