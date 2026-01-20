## 2025-10-27 - [Blocking Password Hashing]
**Vulnerability:** Synchronous password hashing was blocking the Node.js event loop in user creation, creating a Denial of Service (DoS) risk.
**Learning:** Even with fast libraries, CPU-intensive crypto operations must be async on the server to maintain availability. Legacy code often hides synchronous crypto calls in helper functions.
**Prevention:** Audit all crypto imports for synchronous usage. Prefer async/await patterns for all security primitives.

## 2025-05-XX - [Public Project Information Disclosure]
**Vulnerability:** Public projects were exposing sensitive billing/usage data (costs, tokens) via the dashboard stats action to non-owners.
**Learning:** Public visibility shouldn't imply "full transparency" of internal metrics like costs.
**Prevention:** Always filter/redact sensitive fields in data objects based on ownership, even if the parent object is public.

## 2025-02-14 - [Cron Auth Fail-Open]
**Vulnerability:** The Cron API endpoint allowed unauthenticated access if the `CRON_SECRET` environment variable was missing, creating a "fail-open" scenario.
**Learning:** Security checks that rely on environment variables must explicitly check for the variable's existence and fail closed if it's missing.
**Prevention:** Always validate that required security configuration (secrets) exists before performing authorization checks.

## 2025-10-30 - [Project Stats IDOR]
**Vulnerability:** Project statistics and content actions accepted a `projectId` without verifying if the authenticated user had access to that project, allowing unauthorized access to private project metadata.
**Learning:** Authentication middleware only asserts "who you are", not "what you can access". Every Server Action accepting a resource ID must perform an explicit authorization check.
**Prevention:** Use a helper like `ensureProjectAccess` that combines resource fetching with ownership/visibility checks at the start of every action.
