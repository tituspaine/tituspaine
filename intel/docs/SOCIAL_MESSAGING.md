# INTEL Social & Private Messaging Architecture

Status: implemented on `intel-v2-build`; migration 0012 is not production-applied until explicitly authorized.

## Boundaries
Public investigations remain public intelligence records. Profile visibility controls whether activity is aggregated on a user's profile; it does not retroactively hide contributions deliberately published into a public investigation. Private messages require an accepted mutual friendship and every conversation/file request rechecks membership server-side.

## Persistence and scale
Turso stores canonical friendship, conversation, message, receipt/read-pointer, privacy, push-device and attachment metadata. R2 stores avatar and private attachment bytes. Conversation and message lists are bounded and use chronological keyset indexes. Typing state, keyboard state and presence are never database writes. Message client nonces make retries idempotent.

## Friendship discovery
Discovery starts only after a meaningful query, is debounced client-side, candidate-bounded and similarity-filtered server-side. Blocked pairs are excluded. The 95% threshold is a privacy feature, not a general people-search endpoint.

## Mobile chat
The transcript is the only scrolling conversation region. The composer occupies its own bottom grid row and VisualViewport height is used on supporting browsers to keep the composer above the iPhone keyboard without globally moving the document.

## Media
Private message media is stored under non-public R2 keys and served only after conversation authorization. Avatar bytes are R2-backed with a deterministic initials fallback.

## Age and consent
New accounts require a private date of birth and server-side 18+ validation. Rejected under-18 dates are not persisted. Signup separately records acceptance of policies, notification prompting, and cookies. Existing accounts remain usable pending a future deliberate age-completion policy rather than being unexpectedly locked out.

## Notifications
Friend requests, acceptances and new messages reuse the existing notifications table and deep-link into Messages. Browser push subscription/storage is schema-ready, but production Web Push delivery requires VAPID/application-server key configuration and a delivery implementation to be verified before it can be described as operational. OS vibration behavior, especially iOS, is not guaranteed by a web application.

## Production boundary
Do not deploy or apply migration 0012 without explicit instruction. After deployment, apply 0012 through the controlled admin migration flow, validate schema, then smoke-test registration, friendship, messaging, R2 authorization, privacy and iPhone keyboard behavior.
