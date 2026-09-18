# INTEL V3 refinement status

## Implemented on intel-v2-build
Feed-first design tokens and flatter content hierarchy; five-destination mobile navigation; Investigation Posts/Timeline terminology; durable flair filtering; bounded immediate-reply architecture; dedicated progressive thread routes; local Recently Viewed and recent searches; search/command keyboard entry; density-mode foundation; entity dossier layout; contribution evidence references; structured claims domain; pull-based custom feeds; contextual moderation flags; accessibility/menu refinements.

## Schema state
Production migrations 0001-0011 are applied. Migration 0011_claims_feeds_moderation adds claims, claim evidence, custom feeds, contextual moderation state and additional hot-path indexes. Production schema validation and live feature smoke checks remain separate verification steps.

## Architectural invariants
Engagement != verification. Claims remain explicit evidence-oriented records. Large discussions never require a recursive full-tree query. Browser URLs remain authoritative. Server HTML is the baseline. Passive navigation does not write analytics rows to Turso. Core writes remain independent from secondary notification success where practical.

## Remaining verification
Run final CI on the eventual HEAD. After 0011 is applied, validate production schema and then smoke-test anonymous/authenticated/moderator/admin/mobile flows. Repository implementation, CI success, deployment and production verification remain separate states.
