# INTEL production verification

Production: https://intel.tituspaine.com
Branch: intel-v2-build

## Verified production database boundary
On 2026-09-18 production Turso confirmed migrations 0001-0013 and returned ok=true from the production validator. The successful checks included migrations_0001_0013, social_notification_schema, claims_feeds_moderation_schema, hot_path_indexes, investigation_teams_schema, atomic_graph_write, relationship_fts, relationship_provenance, claim_write, atomic_batch_rollback and cleanup.

Migration 0014_notification_fanout_outbox is the only newer schema migration. It must not be described as production-applied until the administrator migration output confirms it.

## Verification states
IMPLEMENTED: present on intel-v2-build.
TESTED: exact final HEAD has successful TypeScript and complete Vitest CI.
DEPLOYED: production Worker is confirmed to contain that final release revision.
PRODUCTION VERIFIED: behavior is exercised successfully on intel.tituspaine.com.

## Required final production sequence
1. Require green exact-HEAD CI.
2. Deploy that exact intel-v2-build revision to the separate INTEL Worker only.
3. Open /admin/database-migration as an INTEL administrator.
4. Apply pending migration 0014_notification_fanout_outbox.
5. Run production schema validation and require ok=true, migrations_0001_0014 and notification_fanout_outbox.
6. Confirm System Health reports Push configured: yes and a healthy fanout backlog.
7. From an iPhone, add INTEL to the Home Screen, launch the installed web app, and enable device notifications from Account.
8. With a second adult test account, verify friend request/accept, profile privacy, conversation creation, text, image, PDF/text attachment, canonical INTEL share, unread/read synchronization, blocking/unblocking and a background push deep-link into the correct conversation.
9. Exercise browser Back/Forward repeatedly across investigation tabs, posts, comments, Search, Messages, Account and deep links.
10. Exercise anonymous/authenticated/moderator/admin smoke paths without creating junk permanent records.
11. Record the exact deployed release SHA and only then mark the final revision PRODUCTION VERIFIED.

## Safety and non-destructive rules
Do not rerun already-applied migrations manually. Do not expose VAPID private keys, Turso tokens, session secrets or Turnstile secrets. Do not create junk production records for synthetic load tests. Destructive concurrency/load testing belongs in test environments.

## Acceptance matrix
Anonymous: Home sorting, Search filters, Investigation tabs, opened Post, comment permalink/thread, Evidence, Entity, Relationship and public profile behavior.
Authenticated: registration/DOB, login/logout, Follow/Save/Like, contribution/reply/edit, evidence/claim links, Following, Notifications, Account activity/Saved pagination, privacy, contact-photo crop, custom feeds, friends/messages/shares/attachments.
Moderator: remove/restore, moderation flags, queue and audit behavior.
Admin: Operations, Publishing, Evidence/Intelligence, Moderation, System Health, Export and database validation.
Mobile: five-destination bottom nav, iPhone safe areas, keyboard/composer stability, installed-PWA notification onboarding, Back/Forward, refresh/deep links, progressive disclosure and long-content handling.
Failure: Turso/R2/push failures must not convert a committed core action into a false failure; duplicate message/share nonce must be idempotent; expired push endpoints must disable cleanly.
