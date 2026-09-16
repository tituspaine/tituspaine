# INTEL Authentication

Public reading is anonymous. Registration requires email, username, password, and a valid server-side Turnstile result. Email and username are normalized before uniqueness checks. A successful registration immediately creates a session; email verification is not a prerequisite in V1.

A follow/login handoff carries a short-lived safe return intent so successful authentication can complete the originally requested follow without trusting an arbitrary redirect URL.

Sessions are opaque random tokens stored only in a Secure/HttpOnly cookie; the database stores a digest. Session lookup validates user state, expiry, revocation, and privilege. Logout revokes the session. Deactivation revokes every active session and prevents future login while retaining historical public authorship.

The UI may show a one-time `Welcome back, {username}!` acknowledgement after a returning session is recognized, but this must not interrupt each navigation.
