import type { IntelDatabase } from './db/types';

export interface Env {
  /** Temporary D1 adapter/binding retained until the verified Turso production cutover. */
  DB: D1Database;
  EVIDENCE: R2Bucket;
  APP_ORIGIN: string;
  ENVIRONMENT: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  SESSION_PEPPER: string;
  ADMIN_USER_IDS?: string;
  /** One-time validation bootstrap secret. Remove after Turso validation/cutover. */
  TURSO_VALIDATION_BOOTSTRAP_TOKEN?: string;
  /** Defaults to d1. Set to turso only at the explicit, verified cutover gate. */
  PERSISTENCE_PROVIDER?: 'd1'|'turso';
  /** Validation/current provider credentials. Never repoint these during production provisioning. */
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  /** Isolated production credentials used only by the pre-cutover production migration/validation gate. */
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
  /** Every normal live V3 request receives exactly one provider-neutral database context at entry. */
  db: IntelDatabase;
}
