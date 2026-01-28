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

## 2025-02-24 - [Server Action Exposure]
**Vulnerability:** The `exportBook` service utility was marked with `"use server"`, exposing it as a public Server Action endpoint. This allowed potential IDOR attacks as it accepted complex data objects without authorization checks, trusting the client-provided input.
**Learning:** Files in `lib/services` marked with `"use server"` automatically become public APIs. If they are intended as internal helpers, this exposes internal logic and bypasses route-level security controls.
**Prevention:** Use `import "server-only"` for internal service modules. Ensure only dedicated action files (e.g., in `app/actions`) use `"use server"` and that they always implement proper authentication and input validation middleware.

## 2025-02-25 - [Export Filename IDOR/Enumeration]
**Vulnerability:** Book export filenames were constructed using only the project name and timestamp (e.g., `name_timestamp.pdf`). Since exports are public on Vercel Blob, this allowed potential enumeration of exported files if the project name was known.
**Learning:** Using predictable identifiers (like timestamps) for publicly accessible resources effectively creates public access, even if the URL isn't explicitly listed.
**Prevention:** Always include a high-entropy identifier (like UUID) in filenames for publicly accessible assets to prevent enumeration attacks.

## 2025-02-26 - [Scene Card IDOR]
**Vulnerability:** `updateSceneCard` allowed updating scene details via `sceneId` without verifying `projectId`, enabling IDOR if the caller (like `updateSceneChronology`) didn't enforce ownership at the DB layer.
**Learning:** Checking ownership at the service layer/action is insufficient if the underlying DB query functions allow unscoped access.
**Prevention:** Always include `projectId` (or parent resource ID) in the `WHERE` clause of database update queries, even if valid IDs are provided.

## 2026-01-28 - [Entity Repository IDOR]
**Vulnerability:** `EntityRepository` update and delete methods allowed operations on entities by ID alone, trusting the service layer's check.
**Learning:** Database repositories must support and enforce ownership scoping as a defense-in-depth measure. Relying solely on service-layer checks leaves a gap if those checks are bypassed or flawed.
**Prevention:** Extend repository methods to accept an optional parent ID (e.g., `projectId`) and strictly scope `WHERE` clauses to that parent ID when provided.
