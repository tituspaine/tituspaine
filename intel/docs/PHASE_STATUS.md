# INTEL V3 phase status
- Phase 0: COMPLETE audit; repository ref integrity re-verified after the V3 commit chain was attached to `intel-v2-build`.
- Phase 1: COMPLETE persistence foundation, now with both D1 and Turso adapters behind `IntelDatabase`. Runtime defaults to D1; Turso requires explicit `PERSISTENCE_PROVIDER=turso` plus both secrets. This prevents accidental split-state cutover.
- Phase 2: BASELINE COMPLETE; live Turso apply pending. Search migration refined to one FTS row per entity with update/delete synchronization. It has not been applied remotely.
- Phase 3: SUBSTANTIALLY COMPLETE auth/account/session provider-neutral paths. Entry now supplies a provider-neutral DB on every request while legacy core remains compatible.
- Phase 4: IN PROGRESS. Entity graph, evidence, investigation reads, core community interactions, update likes, moderation queue/resolution, and portable export have provider-neutral paths. Remaining debt: report threshold workflow, admin investigation/update publishing, notifications, corrections/public-record admin paths, then route cutover.
- Phase 5: search/graph schema foundation complete; route/search migration pending.
- Phase 6: efficiency active; bounded reads, explicit projections and counter reconciliation are used on migrated hot paths.
- Phase 7: pending.
- Phase 8: request metrics foundation present; pending.
- Phase 9: verification active. CI exposed a repository typing defect and legacy-context compatibility issue during this checkpoint; both were corrected. Production-schema and same-origin regression tests were strengthened. A green CI run is required before this checkpoint is considered closed.
- Phase 10: pending.
- Phase 11: pending.

## Stabilization rules
- Do not set `PERSISTENCE_PROVIDER=turso` until every production route that must share state is migrated and Turso migrations/data are verified.
- Do not remove the D1 binding yet; legacy `index.ts`, notifications, corrections and admin tools still use it directly.
- Do not apply `migrations-turso` remotely until the migration suite and CI are green.
- Never commit provider tokens.
