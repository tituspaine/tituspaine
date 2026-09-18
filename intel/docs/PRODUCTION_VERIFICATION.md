# INTEL production verification

Production: https://intel.tituspaine.com
Branch: intel-v2-build

## Verified production database boundary
On 2026-09-18 production Turso confirmed migrations 0001-0014 and returned ok=true from the production validator. Migration 0014_notification_fanout_outbox was applied while 0001-0013 remained already applied. Migration 0015_fanout_retry_health remains pending. After it is applied, require migrations_0001_0015. The prior successful checks included migrations_0001_0014, social_notification_schema, notification_fanout_outbox, claims_feeds_moderation_schema, hot_path_indexes, investigation_teams_schema, atomic_graph_write, relationship_fts, relationship_provenance, claim_write, atomic_batch_rollback and cleanup.

## Verification states
IMPLEMENTED: present on intel-v2-build.
TESTED: exact final HEAD has successful TypeScript and complete Vitest CI.
DEPLOYED: production Worker is confirmed to contain that final release revision.
PRODUCTION VERIFIED: behavior is exercised successfully on intel.tituspaine.com.

## Required final production sequence
1. Require green exact-HEAD CI.
2. Deploy that exact intel-v2-build revision to the separate INTEL Worker only.
3. Confirm System Health reports Push configured: yes and a healthy fanout backlog.
4. From an iPhone, add INTEL to the Home Screen, launch the installed web app, and enable device notifications from Account.
5. With a second adult test account, verify friend request/accept, profile privacy, conversation creation, text, image, PDF/text attachment, canonical INTEL share, unread/read synchronization, blocking/unblocking and a background push deep-link into the correct conversation.
6. Exercise browser Back/Forward repeatedly across investigation tabs, posts, comments, Search, Messages, Account and deep links.
7. Exercise anonymous/authenticated/moderator/admin smoke paths without creating junk permanent records.
8. Record the exact deployed release SHA and only then mark the final revision PRODUCTION VERIFIED.

## Safety and non-destructive rules
Do not rerun already-applied migrations manually. Do not expose VAPID private keys, Turso tokens, session secrets or Turnstile secrets. Do not create junk production records for synthetic load tests. Destructive concurrency/load testing belongs in test environments.

## Acceptance matrix
Anonymous: Home sorting, Search filters, Investigation tabs, opened Post, comment permalink/thread, Evidence, Entity, Relationship and public profile behavior.
Authenticated: registration/DOB, login/logout, Follow/Save/Like, contribution/reply/edit, evidence/claim links, Following, Notifications, Account activity/Saved pagination, privacy, direct contact-photo upload, custom feeds, friends/messages/shares/attachments.
Moderator: remove/restore, moderation flags, queue and audit behavior.
Admin: Operations, Publishing, Evidence/Intelligence, Moderation, System Health, Export and database validation.
Mobile: five-destination bottom nav, iPhone safe areas, keyboard/composer stability, installed-PWA notification onboarding, Back/Forward, refresh/deep links, progressive disclosure and long-content handling.
Failure: Turso/R2/push failures must not convert a committed core action into a false failure; duplicate message/share nonce must be idempotent; expired push endpoints must disable cleanly.
