# INTEL production verification

Production: https://intel.tituspaine.com
Branch: intel-v2-build

## Current boundary
Production database migrations 0001-0010 are verified applied. Repository migration 0011_claims_feeds_moderation is pending production application. Do not describe claims, custom feeds or contextual moderation state as production-verified until 0011 is applied and schema validation succeeds.

## Verification states
IMPLEMENTED: present on intel-v2-build.
TESTED: final HEAD has a successful TypeScript/Vitest CI run.
DEPLOYED: production Worker is confirmed to contain the final release header/revision.
PRODUCTION VERIFIED: behavior is exercised successfully on intel.tituspaine.com.

## Smoke matrix after 0011
Anonymous: Home Best/Active/Latest, Latest pagination, Search filters, Investigation Posts/Timeline/Evidence/Entities, flair links, opened Post, comment thread route, Evidence, Entity dossier, Relationship, Profile.
Authenticated: Join/Leave, Follow, Save, Like, create Post, comment, reply, edit, attach evidence, create claim, Following, Notifications, Account recents/density, custom feeds.
Moderator: remove/restore, source-request/context flags, queue and audit behavior.
Admin: Operations, Publishing, Evidence/Intelligence, Moderation, System Health, Export, Database validation.
Mobile: five-destination bottom nav, iPhone safe area, Back/Forward, refresh/deep links, post/comment progressive disclosure, menus, keyboard/composers, long content.

## Non-destructive rule
Do not create junk production records for testing. Destructive concurrency/load tests belong in local/test environments.
