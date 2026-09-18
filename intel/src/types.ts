import type { IntelDatabase } from './db/types';

export interface Env {
  EVIDENCE: R2Bucket;
  APP_ORIGIN: string;
  ENVIRONMENT: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  SESSION_PEPPER: string;
  ADMIN_USER_IDS?: string;
  /** Optional VAPID public key. Push subscriptions can be registered only when configured. */
  WEB_PUSH_PUBLIC_KEY?: string;
  /** Operational migration token. Never expose or commit its value. */
  TURSO_VALIDATION_BOOTSTRAP_TOKEN?: string;
  /** Optional isolated validation database credentials. */
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  /** Authoritative INTEL production relational database. */
  TURSO_PRODUCTION_DATABASE_URL?: string;
  TURSO_PRODUCTION_AUTH_TOKEN?: string;
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
  db: IntelDatabase;
}
