# INTEL Deployment

Source of truth is `tituspaine/tituspaine`. INTEL code/config lives under `/intel`; the existing root personal site and `www.tituspaine.com` CNAME remain intact.

Production target: `intel.tituspaine.com` on Cloudflare Workers with D1, R2, Turnstile, and required Worker secrets/bindings. No alternate hosting provider is part of the production architecture.

Deployment is blocked until the Cloudflare account/resources are available to the build operator. Before production cutover: create/bind D1 and R2, configure Turnstile and application secrets, apply migrations, deploy Worker, bind custom hostname, verify TLS/DNS, run end-to-end tests against production, then add the root-site INTEL navigation link if not already shipped.

Never put secrets into GitHub source. Resource identifiers/configuration that are safe to publish belong in version control; secret values belong in Cloudflare secrets.
