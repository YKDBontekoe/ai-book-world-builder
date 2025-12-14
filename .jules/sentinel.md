## 2024-05-22 - [IDOR in Generation Endpoints]
**Vulnerability:** API endpoints (`/api/generations/[id]/run`) used direct `db.select()` on `bookGeneration` without verifying `project.userId`, allowing users to run generations on public projects owned by others.
**Learning:** `getProjectByIdWithAccess` permits `public` visibility, which is unsafe for "write/execute" actions (like running an LLM generation). The `bookGeneration` table does not have a `userId` column, necessitating a JOIN with `project`.
**Prevention:** Always verify `project.userId === session.user.id` for any action that consumes resources or modifies state, even if the resource is "public". Prefer `innerJoin(project)` to strictly enforce ownership in queries.

## 2025-12-14 - Missing Auth Check in Server Actions
**Vulnerability:** `getScenesData` server action lacked authentication and authorization checks, allowing IDOR.
**Learning:** Server Actions with `"use server"` are public endpoints. `getScenesData` was completely exposed. Imports like `getProjectByIdWithAccess` must be used explicitly.
**Prevention:** Audit all exported `"use server"` functions for `auth()` and ownership verification.
