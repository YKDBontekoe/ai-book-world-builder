## 2024-05-23 - [Critical IDOR in AI Generation Tools]
**Vulnerability:** The `updateSceneCards` tool used `getFullProjectDataForGeneration` which allows read access to public projects, but proceeded to perform write operations (creating/updating scenes) without verifying that the user owned the project.
**Learning:** Helper functions designed for data fetching (like `getFullProjectDataForGeneration`) often support "public read" access. Using them in write-heavy tools creates invisible IDOR vulnerabilities where users can modify public projects they don't own.
**Prevention:** In every tool that modifies data, explicitly verify `project.userId === session.user.id` immediately after fetching the project data, regardless of how the data was fetched.

## 2025-05-27 - [IDOR in Lore Generation Service]
**Vulnerability:** The `generateLore` service function called `ensureProjectAccess(projectId)` which defaults to read-only access for public projects. However, the function proceeds to insert new entities into the database, allowing any authenticated user to pollute public projects with arbitrary data.
**Learning:** Functions that mix access checks (`ensureProjectAccess`) with write operations must explicitly request `requireOwner=true`. Defaulting to read access is dangerous for service methods that perform writes.
**Prevention:** Audit all service methods that perform database writes. Ensure they pass `true` to `ensureProjectAccess` or explicitly check `project.userId === session.user.id`.
