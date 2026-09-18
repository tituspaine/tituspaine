# INTEL V3 refinement status

## Implemented on intel-v2-build
INTEL V3 now includes five-destination mobile navigation; Home Best/Active/Latest/Following sorting; bounded investigation posts and progressive comment threads; evidence, claims, provenance, entities and relationships; custom feeds; moderation/audit controls; mutual-friend social graph; private direct conversations; keyset chat, message, Account activity and Saved pagination; private R2 attachments with content-signature validation and rolling sender quotas; adjustable optimized contact photos; profile activity privacy across both profile surfaces; blocking that severs follows and gates conversations/attachments; adult-only signup and one-time legacy age verification; canonical/idempotent private sharing; notification preferences; social unread synchronization; standards-based Web Push delivery; iPhone Home Screen onboarding; and a durable leased/resumable follower-notification outbox; background secondary notification work; chronological post-history pagination; and CI Worker bundle dry-runs.

## Schema state
Production migrations 0001-0014 were confirmed applied and validated on 2026-09-18. The 0014 immutable migration artifact was pinned to commit 07b7d95b711125069adbf199a6e98d0a5f4c7b06 and production validation passed migrations_0001_0014 plus notification_fanout_outbox.

## Architectural invariants
Engagement is not verification. Public contributions remain part of public investigations when profile activity is private. Mutual friendship is enforced server-side before messaging. Blocking overrides social profile/friend/message creation access. Private media is authorization-gated and never shared-cacheable. High-growth history uses keyset pagination. Core writes do not depend on push delivery. Follower discovery remains pull-authoritative while notification materialization is resumable, idempotent and bounded outside the publishing request. No typing/presence/page-view writes are added to Turso.

## Remaining external production gates
Deploy the final Worker revision, verify the already-provisioned VAPID secrets by exercising real device push, and execute the production smoke matrix. IMPLEMENTED, TESTED, DEPLOYED and PRODUCTION VERIFIED remain separate states.
