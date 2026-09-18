# INTEL production verification

Production: https://intel.tituspaine.com
Worker: tituspaine-intel
Development branch: intel-v2-build

## Verified database state
Production migrations 0001 through 0009 have been applied through the authenticated Admin database maintenance flow. Migration 0009_post_thread_scaling is the current schema generation and adds the post/thread scaling indexes.

## Repository hardening after 0009
The branch contains the dedicated Investigation -> Post -> Comment -> Reply routing model, bounded collection reads, post-context deep links, endpoint-class rate limits, bounded/chunked follower fan-out, notification failure containment, mobile safe-area/menu fixes, admin operations consolidation, live DB System Health probing and request correlation identifiers.

## Verification boundary
IMPLEMENTED means present on intel-v2-build.
TESTED means TypeScript/Vitest or another explicit test run was observed passing.
DEPLOYED means the production Worker is confirmed to contain the relevant branch revision.
PRODUCTION VERIFIED means the behavior was exercised successfully against intel.tituspaine.com.

Do not collapse these states into one claim. The GitHub connector available during this hardening pass does not expose push-triggered INTEL CI runs through its commit-workflow endpoint, and combined commit status may be empty. Therefore repository changes are not described as CI-passed solely because they were pushed.

## Required final production smoke matrix
After the hardened revision is deployed, verify:
- anonymous Home, Latest, Search, Investigation, opened Post, comment permalink, Evidence, Entity, Relationship and Profile;
- authenticated Join/Leave, Follow user, Save, Like, create Post, comment, reply, edit, report, Following, Notifications and Account;
- moderator remove/restore and queue reconciliation;
- admin Operations, Publishing, Evidence/Intelligence, Moderation, System Health, Export and Database validation;
- iPhone Safari Back/Forward, refresh, direct deep links, anchors, fixed bottom navigation, menus, keyboard/composers and safe-area behavior;
- failure behavior for missing records and optional notification failures.

## Non-destructive rule
Do not create junk production investigations/evidence/reports solely for smoke testing. Use genuine records or a non-production validation environment for destructive/concurrency/load tests.
