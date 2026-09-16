# INTEL Worker

Separate Cloudflare Worker application for `https://intel.tituspaine.com`. It intentionally does not modify or replace the root `tituspaine` Worker configuration.

## Local/repository validation

```bash
cd intel
npm install
npm run typecheck
npm test
npx wrangler d1 migrations apply intel-db --local
npm run dev
```

## Required Cloudflare resources

Exact production names/bindings:

- Worker: `tituspaine-intel`
- Custom domain: `intel.tituspaine.com`
- D1 database: `intel-db`, Worker binding `DB`
- R2 bucket: `intel-evidence`, Worker binding `EVIDENCE`
- Secret: `SESSION_PEPPER`
- Secret: `TURNSTILE_SECRET_KEY`
- Variable/secret: `ADMIN_USER_IDS` after the Titus account is created
- Plain vars already versioned: `APP_ORIGIN=https://intel.tituspaine.com`, `ENVIRONMENT=production`

After D1 creation, replace `REPLACE_WITH_D1_DATABASE_ID` in `intel/wrangler.jsonc` with the returned database UUID and commit that non-secret ID to this branch.

## Production commands

```bash
cd intel
npm ci
npm run typecheck
npm test
npx wrangler d1 migrations apply intel-db --remote
npx wrangler secret put SESSION_PEPPER
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler deploy
```

Create `SESSION_PEPPER` as at least 32 cryptographically random bytes (64 hexadecimal characters is appropriate). Do not commit it.

Turnstile must be configured for `intel.tituspaine.com`; place its secret key in `TURNSTILE_SECRET_KEY`. The public site key will be added to the registration UI once provisioned.

Create the first Titus account through normal registration, obtain its immutable user ID from D1, then set `ADMIN_USER_IDS` to that UUID and redeploy. Admin authorization is server-side and never inferred from username/email.

## Custom domain

In Cloudflare Workers & Pages, open Worker `tituspaine-intel` → Settings → Domains & Routes → Add → Custom Domain → enter exactly `intel.tituspaine.com`. Cloudflare should create/manage the required DNS route in the same zone. Do not add this hostname to the existing `tituspaine` Worker.
