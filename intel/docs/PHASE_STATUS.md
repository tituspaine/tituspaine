# INTEL V3 refinement status

## Implemented on intel-v2-build
INTEL V3 now includes five-destination mobile navigation; Home Best/Active/Latest/Following sorting; bounded investigation posts and progressive comment threads; evidence, claims, provenance, entities and relationships; custom feeds; moderation/audit controls; mutual-friend social graph; private direct conversations; keyset chat, message, Account activity and Saved pagination; private R2 attachments with content-signature validation; adjustable optimized contact photos; profile activity privacy; blocking; adult-only signup and one-time legacy age verification; canonical/idempotent private sharing; notification preferences; social unread synchronization; standards-based Web Push delivery; iPhone Home Screen onboarding; and a durable resumable follower-notification outbox.

## Schema state
Production migrations 0001-0013 were confirmed applied and validated on 2026-09-18. Migration 0014_notification_fanout_outbox is implemented on the branch and is the only pending production schema change. Its immutable migration artifact is pinned to commit 34a8f00ebedfcfd31a89746d21bc7632d66de0b6.

## Architectural invariants
Engagement is not verification. Public contributions remain part of public investigations when profile activity is private. Mutual friendship is enforced server-side before messaging. Blocking overrides social profile/friend/message creation access. Private media is authorization-gated and never shared-cacheable. High-growth history uses keyset pagination. Core writes do not depend on push delivery. Follower discovery remains pull-authoritative while notification materialization is resumable, idempotent and bounded outside the publishing request. No typing/presence/page-view writes are added to Turso.

## Remaining external production gates
Apply and validate 0014 after the final Worker revision is deployed, verify the already-provisioned VAPID secrets by exercising real device push, and execute the production smoke matrix. IMPLEMENTED, TESTED, DEPLOYED and PRODUCTION VERIFIED remain separate states.
