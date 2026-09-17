# INTEL V3 phase status
- Phase 0: COMPLETE — actual repository/runtime audit established `src/entry.ts` as the Worker entry and documented the legacy D1 architecture.
- Phase 1: COMPLETE — `IntelDatabase` persistence boundary with D1 and Turso/libSQL adapters. Provider selection remains explicit; production still defaults to D1.
- Phase 2: BASELINE COMPLETE — fresh Turso/libSQL core and FTS migrations exist and are regression-tested statically. They have NOT been applied to a remote database yet.
- Phase 3: COMPLETE — auth/account/session paths are provider-neutral and the live router creates one database context per request.
- Phase 4: COMPLETE — all live application routes are provider-neutral. Admin investigation creation and update publishing are repository-backed; publishing content/counter/audit changes is atomic, and follower notification fan-out uses the known update ID instead of a post-request latest-row lookup. Dashboard, comment permalinks and evidence metadata were extracted. `core.fetch()` was eliminated and retired `src/index.ts` deleted after its routes were replaced. `RequestContext.db` is strict again. The only D1-specific runtime code intentionally retained is the D1 provider adapter/binding used while production remains on D1.
- Phase 5: IN PROGRESS — unified FTS route is live and entity relationships/aliases/provenance schema foundation exists. Next gate is validation against real Turso/libSQL, then graph/provenance refinement.
- Phase 6: efficiency work active; bounded reads and explicit projections are standard on migrated paths. Full hot-path/caching pass follows Phase 5 validation.
- Phase 7: pending full mobile/professional UI refinement.
- Phase 8: request DB metrics foundation present; security/abuse/observability pass pending.
- Phase 9: verification active. The post-legacy-removal checkpoint passed typecheck and automated tests in CI.
- Phase 10: pending.
- Phase 11: pending.

## Turso validation gate
The codebase has reached the external-account gate. Create/connect a free Turso account and a non-production validation database. Do not set production `PERSISTENCE_PROVIDER=turso`, do not remove the D1 binding, and do not point `intel.tituspaine.com` at Turso yet. The first remote use is validation only: apply the V3 migrations to an empty validation database, verify transaction behavior, FTS5/search triggers, schema constraints and the web adapter, then fix any incompatibilities before a cutover plan is approved.

## Stabilization rules
- Production remains on D1 until remote Turso validation and a separate verified data/cutover plan are complete.
- Keep the D1 adapter/binding as rollback capability until Phase 11 verifies Turso production operation.
- Never commit database URLs containing credentials, auth tokens, session peppers or Turnstile secrets.
- Orendrix Properties is outside this project and must not be modified.
