# INTEL production verification

Production: https://intel.tituspaine.com
Branch: intel-v2-build

## Current boundary
Production database migrations 0001-0011 are applied. Migration application for 0011_claims_feeds_moderation was confirmed from the production admin migration response on 2026-09-18. Production schema validation succeeded on 2026-09-18. The validator confirmed migrations_0001_0011, claims_feeds_moderation_schema, hot_path_indexes, investigation_teams_schema, atomic_graph_write, relationship_fts, relationship_provenance, claim_write, atomic_batch_rollback and cleanup. Live route/interaction smoke checks remain a separate verification gate.

## Verification states
IMPLEMENTED: present on intel-v2-build.
TESTED: final HEAD has a successful TypeScript/Vitest CI run.
DEPLOYED: production Worker is confirmed to contain the final release header/revision.
PRODUCTION VERIFIED: behavior is exercised successfully on intel.tituspaine.com.

## Smoke matrix after 0011 validation
Anonymous: Home Best/Active/Latest, Latest pagination, Search filters, Investigation Posts/Timeline/Evidence/Entities, flair links, opened Post, comment thread route, Evidence, Entity dossier, Relationship, Profile.
Authenticated: Join/Leave, Follow, Save, Like, create Post, comment, reply, edit, attach evidence, create claim, Following, Notifications, Account recents/density, custom feeds.
Moderator: remove/restore, source-request/context flags, queue and audit behavior.
Admin: Operations, Publishing, Evidence/Intelligence, Moderation, System Health, Export, Database validation.
Mobile: five-destination bottom nav, iPhone safe area, Back/Forward, refresh/deep links, post/comment progressive disclosure, menus, keyboard/composers, long content.

## Non-destructive rule
Do not create junk production records for testing. Destructive concurrency/load tests belong in local/test environments.

## Final repository verification
Final repository verification must be performed on the exact final HEAD after documentation and validator cleanup. A successful earlier run is evidence for that earlier revision only; it is not silently promoted to a newer commit. Production deployment and production smoke verification remain independent gates.

## Exact-head CI
The final verification run must target the exact final intel-v2-build HEAD. Superseded or cancelled runs are not treated as success. TypeScript and the complete Vitest suite must both complete successfully before deployment status is advanced.

## Production database validation evidence
On 2026-09-18 production returned ok=true for validator runId `180fe722-0c6e-47d0-9ca7-9596f2ab76f6`. Checks passed: migrations_0001_0011, claims_feeds_moderation_schema, hot_path_indexes, investigation_teams_schema, atomic_graph_write, relationship_fts, relationship_provenance, claim_write, atomic_batch_rollback, cleanup.


## Current social completion gate
Production 0012 is verified. Migration 0013_social_notification_preferences is branch-complete but pending production application. The final Worker revision must be deployed after exact-HEAD CI succeeds. Browser push subscription registration and the service worker are implemented; actual background Web Push delivery remains an external configuration gate because production VAPID signing credentials have not been provisioned/verified.

## Required production sequence
1. Confirm exact final intel-v2-build HEAD CI succeeds.
2. Deploy that exact branch revision to the separate INTEL Worker only.
3. Open /admin/database-migration while authenticated as an INTEL administrator.
4. Apply pending migrations; confirm 0013_social_notification_preferences:applied.
5. Run Validate production schema; require ok=true and migrations_0001_0013 plus social_notification_schema.
6. Configure the Web Push public/private VAPID signing credentials in the INTEL Worker environment without committing secrets.
7. Redeploy if the environment requires it, enable device notifications from Account, and test a friend request, friend acceptance, direct message, attachment, private INTEL share and notification deep link on a real installed iPhone web app.
8. Run the full anonymous/authenticated/moderator/admin/mobile smoke matrix and record the exact deployed release SHA.

## 2026-09-18 social schema verification
Production Turso migration output confirmed `0012_social_messaging_privacy:applied`. The administrator validation run returned `ok: true` with `migrations_0001_0012`, claims/feeds/moderation schema, hot-path indexes, investigation teams, atomic graph write, relationship FTS/provenance, claim write, transaction rollback, and cleanup checks passing. Application/UI smoke verification remains a separate deployment boundary.
