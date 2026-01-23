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

## 2025-02-23 - [Chapter Operations IDOR]
**Vulnerability:** Chapter update, delete, and reorder operations were vulnerable to IDOR because they did not verify that the target chapter ID belonged to the authenticated project ID in the database query.
**Learning:** Validating ownership of the *parent* resource (Project) is insufficient if the *child* resource (Chapter) operation does not also scope the query to that parent.
**Prevention:** Always include the parent ID (e.g., `projectId`) in the `WHERE` clause of UPDATE/DELETE operations for child resources to enforce ownership boundaries at the database level.

## 2025-02-24 - [Scene Operations IDOR]
**Vulnerability:** Scene deletion and content updates were vulnerable to IDOR because the repository methods accepted an ID and performed the operation without checking if the scene belonged to the authenticated user's project, trusting only the service layer's check.
**Learning:** Defense in depth requires database repositories to also support and enforce ownership scoping, preventing vulnerabilities if the service layer check is bypassed or malformed.
**Prevention:** Extend repository methods (update/delete) to accept an optional parent ID (e.g., `projectId`) and include it in the `WHERE` clause to strictly scope the operation to the authorized context.

## 2025-02-25 - [Entity Operations IDOR]
**Vulnerability:** Entity update, delete, and bulk delete operations were vulnerable to IDOR because the repository methods relied solely on the entity ID, trusting the service layer's ownership check without enforcing scoping at the database level.
**Learning:** Consistent application of "Defense in Depth" is critical. Even if similar patterns were fixed elsewhere (Scenes, Chapters), every resource repository must be audited and hardened individually.
**Prevention:** Extend `EntityRepository` methods (`update`, `delete`, `bulkDelete`) to accept an optional `projectId` and include it in the `WHERE` clause to strictly scope the operation to the authorized context.
