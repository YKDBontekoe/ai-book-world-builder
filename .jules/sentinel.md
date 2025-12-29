## 2024-05-23 - [Critical IDOR in AI Generation Tools]
**Vulnerability:** The `updateSceneCards` tool used `getFullProjectDataForGeneration` which allows read access to public projects, but proceeded to perform write operations (creating/updating scenes) without verifying that the user owned the project.
**Learning:** Helper functions designed for data fetching (like `getFullProjectDataForGeneration`) often support "public read" access. Using them in write-heavy tools creates invisible IDOR vulnerabilities where users can modify public projects they don't own.
**Prevention:** In every tool that modifies data, explicitly verify `project.userId === session.user.id` immediately after fetching the project data, regardless of how the data was fetched.

## 2024-05-24 - [Information Exposure via Implicit Select]
**Vulnerability:** The `getUserDetails` Server Action used `db.select().from(user)` which defaults to selecting *all* columns, including the hashed `password` field. This data was then returned to the client-side admin dashboard.
**Learning:** ORMs often default to `SELECT *` for convenience. In full-stack TypeScript apps sharing types between DB and Client, this makes it easy to accidentally leak sensitive fields that exist on the schema but shouldn't leave the server.
**Prevention:** Always use explicit field selection (e.g., `db.select({ id: ..., email: ... })`) when querying users or sensitive entities intended for client consumption. Never return raw DB objects containing secrets.
