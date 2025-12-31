## 2024-05-23 - [Critical IDOR in AI Generation Tools]
**Vulnerability:** The `updateSceneCards` tool used `getFullProjectDataForGeneration` which allows read access to public projects, but proceeded to perform write operations (creating/updating scenes) without verifying that the user owned the project.
**Learning:** Helper functions designed for data fetching (like `getFullProjectDataForGeneration`) often support "public read" access. Using them in write-heavy tools creates invisible IDOR vulnerabilities where users can modify public projects they don't own.
**Prevention:** In every tool that modifies data, explicitly verify `project.userId === session.user.id` immediately after fetching the project data, regardless of how the data was fetched.

## 2024-05-24 - [Information Exposure via Implicit Select]

**Vulnerability:** The `getUserDetails` Server Action used `db.select().from(user)` which defaults to selecting *all* columns, including the hashed `password` field. This data was then returned to the client-side admin dashboard.
**Learning:** ORMs often default to `SELECT *` for convenience. In full-stack TypeScript apps sharing types between DB and Client, this makes it easy to accidentally leak sensitive fields that exist on the schema but shouldn't leave the server.
**Prevention:** Always use explicit field selection (e.g., `db.select({ id: ..., email: ... })`) when querying users or sensitive entities intended for client consumption. Never return raw DB objects containing secrets.

## 2025-12-31 - [IDOR Vulnerability in Bulk Delete Actions]

**Vulnerability:** A bulk `deleteProjects` action accepted a list of IDs, fetched all corresponding projects from the database, and *then* filtered them in the application layer to check for ownership. This allowed an attacker to confirm the existence of valid project IDs belonging to other users by observing which requests failed silently versus those that proceeded, even if the final deletion was blocked.
**Learning:** Security checks should be applied at the earliest possible stage. For database operations, this means enforcing ownership and access controls directly within the `WHERE` clause of the SQL query. This prevents the application from ever accessing or processing unauthorized data.
**Prevention:** When performing bulk operations, modify the initial database query to include an ownership check (e.g., `...where(and(inArray(project.id, projectIds), eq(project.userId, userId)))`). Additionally, verify that the number of items returned from the database matches the number of IDs requested. If they don't match, return an "Access Denied" error to prevent silent failures that can leak information.
