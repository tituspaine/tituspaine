# INTEL efficiency budgets

These are regression targets, not permission to spend up to the limit.

- Initial authenticated screen: target 1 API request after document navigation; <= 8 DB statements until screen-specific consolidation is complete.
- Passive UI actions (scroll, hover, open/close menus, local filters): 0 DB writes.
- Growing collections: hard page limit <= 50; prefer 20-30 on mobile; cursor/keyset pagination.
- Public reference responses: cache whenever correctness/privacy permit.
- Owner telemetry: never create one Turso write per request.
- Binary evidence/media: R2, never relational blobs.
- Any hot endpoint whose query plan changes materially must be treated as a performance regression until explained.

Phase 6 will tighten endpoint-specific budgets after route conversion provides measurable baselines.
