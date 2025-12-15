# Sentinel Journal

## 2025-02-18 - [AI Tool IDOR Vulnerability]
**Vulnerability:** AI Tools (like `draft-scene`) were using `projectId` for context fetching but failing to verify that the user owned the project. Furthermore, they blindly trusted that dependent IDs (like `sceneId`) belonged to the authorized `projectId`.
**Learning:** AI Tools are often treated as trusted internal functions, but when exposed to user prompts, they are effectively public API endpoints and require the same rigorous authorization checks as Server Actions.
**Prevention:** Every AI Tool `execute` function must start with explicit ownership verification of the primary resource (Project) and validate that all secondary resources (Scenes, Chapters) belong to that Project.
