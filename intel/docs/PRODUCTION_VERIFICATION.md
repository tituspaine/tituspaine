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
