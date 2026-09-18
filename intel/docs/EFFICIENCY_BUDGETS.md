# INTEL efficiency budgets

These are regression budgets, not targets to consume.

## Database
- Anonymous request without a session cookie: zero session lookup statements.
- Growing collection: hard server maximum; <=50 preferred, <=100 only for operational/bounded views.
- Initial mobile feeds: 20-40 rows preferred.
- Search: <=100 input characters, <=8 FTS tokens, <=40 rendered results.
- Thread reads: bounded and indexed by investigation/parent/root/time/rank.
- No passive UI DB writes.
- No relational binary blobs; evidence files remain in R2.
- Hot counters are maintained on mutation rather than reconciled with full COUNT on each request.

## Notification work
- Core publishing must succeed independently of follower/mention notification delivery.
- Follower fan-out is capped at 200 recipients per synchronous operation and written in chunks of 50.
- A larger audience must not make the core record disappear or roll back.

## Cache classes
1. Auth/account/admin/moderation/private: private, no-store.
2. Anonymous investigation/post pages: short shared TTL + SWR.
3. Anonymous search/reference pages: short bounded shared caching where content is public.
4. Versioned static assets: longer caching is acceptable.
5. Never shared-cache personalized state.

## Abuse budgets per minute, per Worker isolate
- auth 12
- search 60
- content 24
- engagement 120
- report 10
- evidence 12
- admin 30

The isolate-local limiter is defense-in-depth. It is not a globally consistent distributed rate limit.

## Observability
- Every response carries X-Request-Id.
- Do not write one telemetry record per ordinary request.
- System Health uses bounded reads.
- Do not log session tokens, password material, Turso credentials or R2 secrets.
