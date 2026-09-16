# INTEL Security

## Boundaries

All authorization is enforced in the Worker. UI visibility is never authorization. Mutations require authenticated sessions and explicit role/capability checks. Admin operations require stronger server-side authorization and separate elevated-session controls.

## Web controls

Use a restrictive Content-Security-Policy, `X-Content-Type-Options: nosniff`, appropriate Referrer-Policy, Permissions-Policy, HSTS at the Cloudflare/domain layer, output escaping, parameterized D1 statements, strict JSON/form validation, body-size limits, safe redirects, and origin/CSRF checks for cookie-authenticated mutations.

## Authentication

Registration requires server-validated Turnstile. Email/username uniqueness failures are handled without exposing unnecessary account information. Login and registration are rate limited. Password material is salted and derived with a Worker-compatible versioned KDF. Sessions use high-entropy opaque identifiers in Secure/HttpOnly cookies; D1 stores only token digests. Session rotation, expiration, logout revocation, account deactivation revocation, and elevated admin re-authentication are required.

The product-mandated four-character minimum materially weakens password entropy. Compensating controls reduce but do not eliminate that risk.

## User content

Comments are plain user content, not trusted markup. Render encoded text or a tightly controlled parser. No public edit/delete API exists. Report insertion is unique per user/comment/category. Auto-hide occurs only at ten eligible unique reports in one category and preserves the original comment.

## Uploads

Validate declared and detected type, extension policy, size, object key, and authorization. Never trust client MIME alone. Store SHA-256. Serve risky documents with safe content disposition where appropriate. Never overwrite an existing evidence object key.

## Privacy

Email, sessions, and security metadata are private. Username and intentionally public contributions are public. Raw IP addresses are not user identity and should not be retained indefinitely merely because Cloudflare exposes network metadata.
