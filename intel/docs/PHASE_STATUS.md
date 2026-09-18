# INTEL V3 refinement status

## Implemented on intel-v2-build
The V3 community/intelligence architecture is implemented through the social-messaging hardening series: five-destination mobile navigation (Home, Search, Following, Messages, Account); Home Best/Active/Latest/Following sorting with the redundant standalone Latest destination removed; bounded investigation posts and progressive comment threads; evidence, claims, provenance, entities and relationships; custom feeds; moderation/audit controls; mutual-friend social graph; private direct conversations; keyset message/chat pagination; private R2 message attachments; contact photos; profile activity privacy; adult-only signup with private DOB verification; blocking; private friend sharing of INTEL records; durable push-subscription registration; service-worker notification reception; notification preferences; and bounded unread-notification lookup.

## Schema state
Production migrations 0001-0012 are confirmed applied and the production validator passed through 0012 on 2026-09-18. Migration 0013_social_notification_preferences is implemented on the branch but is NOT production-applied yet. It deliberately uses social_notification_preferences because 0007 already owns the separate per-investigation notification_preferences table.

## Architectural invariants
Engagement != verification. Public contributions do not disappear when a profile becomes private. Mutual friendship is required server-side before direct messaging. Blocks prevent friendship/message access. Message and conversation history use keyset pagination. Attachments remain private in R2 and are served only after conversation authorization. Typing, keyboard state and presence do not write to Turso. Core durable writes do not depend on notification delivery succeeding. Push subscriptions are durable records, but actual Web Push delivery is not considered complete until VAPID signing and production secrets are configured and exercised.

## Remaining external/production gates
Run exact-HEAD CI, deploy the final Worker revision, apply 0013 from the administrator database console, validate production schema, configure Web Push signing credentials, then exercise the production smoke matrix. IMPLEMENTED, TESTED, DEPLOYED and PRODUCTION VERIFIED remain separate states.
