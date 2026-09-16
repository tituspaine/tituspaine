# INTEL Moderation

Public comments and replies are immutable to their authors after posting. The composer must state: `Comments cannot be edited or deleted after posting.` Account deactivation does not remove prior contributions.

Moderation changes visibility rather than destroying the normal record. `VISIBLE`, `AUTO_HIDDEN`, and `MOD_REMOVED` are public-state transitions backed by moderation/audit records.

## Reporting

Categories: SPAM, HARASSMENT, THREAT, PERSONAL INFORMATION, IMPERSONATION, MISLEADING/FALSE CONTENT, OTHER. One reporter may create only one report for a given comment/category. Reports are authenticated and rate limited.

When ten eligible unique accounts have OPEN/ACTIONED-equivalent qualifying reports for the same comment and category, a transactional service changes the comment to `AUTO_HIDDEN`, creates one pending moderation queue item, and appends an audit event. Public UI shows a continuity placeholder such as `[Comment hidden after community reports pending review]`.

An administrator may confirm removal or restore the comment. Restoration and confirmed removal are auditable. Suspicious accounts may be challenged or made ineligible through deterministic abuse controls, but the threshold itself remains exactly ten eligible unique same-category reporters; there is no secret weighted voting.
