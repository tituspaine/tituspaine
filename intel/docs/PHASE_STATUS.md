# INTEL V3 phase status
- Phase 0: COMPLETE audit.
- Phase 1: COMPLETE persistence foundation.
- Phase 2: BASELINE COMPLETE; live Turso apply pending.
- Phase 3: SUBSTANTIALLY COMPLETE auth/account/session provider-neutral paths.
- Phase 4: IN PROGRESS. Entity graph, evidence, investigation reads, follows, comment publishing and comment likes have provider-neutral repository paths. Comment publish + counters + audit are atomic. Reply depth is enforced at 8. Follow/like counters are reconciled from source-of-truth membership rows to resist drift. Reports/moderation/admin investigation writes remain.
- Phase 5: search/graph schema foundation complete; route/search migration pending.
- Phase 6: efficiency work active; bounded reads and stable projections in place.
- Phase 7: pending.
- Phase 8: request metrics foundation present; pending.
- Phase 9: initial tests present; pending.
- Phase 10: pending.
- Phase 11: pending.
External gate: live Turso credentials still not required. Never commit provider tokens.
