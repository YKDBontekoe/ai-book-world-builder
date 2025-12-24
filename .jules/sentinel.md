## 2024-05-23 - [Critical IDOR in AI Generation Tools]
**Vulnerability:** The `updateSceneCards` tool used `getFullProjectDataForGeneration` which allows read access to public projects, but proceeded to perform write operations (creating/updating scenes) without verifying that the user owned the project.
**Learning:** Helper functions designed for data fetching (like `getFullProjectDataForGeneration`) often support "public read" access. Using them in write-heavy tools creates invisible IDOR vulnerabilities where users can modify public projects they don't own.
**Prevention:** In every tool that modifies data, explicitly verify `project.userId === session.user.id` immediately after fetching the project data, regardless of how the data was fetched.
