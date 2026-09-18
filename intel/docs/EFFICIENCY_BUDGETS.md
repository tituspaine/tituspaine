# INTEL efficiency budgets

## Read budgets
Home/Latest: initial 30 records or fewer.
Investigation Posts: <=30.
Opened Post: <=20 top-level comments plus <=3 immediate reply previews per visible parent.
Dedicated reply thread: <=30 immediate children per page.
Search: <=100 input characters, <=8 FTS tokens, <=40 rendered results.
Entity dossier: each contextual collection <=50; evidence/investigation context <=30.
No recursive whole-thread read. No OFFSET on high-growth chronological collections.

## Write budgets
Core contribution/reaction/moderation writes remain transactional and bounded. Notifications, escalation and other secondary work must not invalidate a persisted core action. Follower notification fan-out remains bounded/chunked.

## Passive activity
Recently viewed and recent searches stay browser-local and bounded. Do not create a Turso write for ordinary page views or searches.

## Cache classes
Authenticated/account/admin/moderation/private: private, no-store.
Anonymous public records: short shared TTL + SWR only when no personalized state is rendered.
Versioned static assets may use longer caching.
Never shared-cache liked/saved/joined/admin/private state.

## Abuse
auth 12/min; search 60/min; content 24/min; engagement 120/min; report 10/min; evidence 12/min; admin 30/min per Worker isolate. This is defense-in-depth, not a globally consistent quota.

## Observability
Every response carries X-Request-Id. System Health remains bounded. Never log credentials, passwords or session tokens.
