## 2024-05-22 - [Critical IDOR in Public Projects]
**Vulnerability:** Found that `updateEntityAction` and `deleteEntityAction` used `getProjectByIdWithAccess` which returns public projects regardless of ownership, allowing unauthorized modification of entities in public projects.
**Learning:** Functions that check "access" (read) are not sufficient for "modification" (write). Public visibility grants read access to everyone, but write access must be restricted to the owner.
**Prevention:** Always verify `project.userId === session.user.id` explicitly for write operations, even if `getProjectByIdWithAccess` returns a project.

## 2024-05-22 - [IDOR in AI Tools]
**Vulnerability:** The `createScene` AI tool allowed creating scenes in any project by specifying a `projectId`, without verifying that the authenticated user owned that project. This is an Insecure Direct Object Reference (IDOR) vulnerability.
**Learning:** While Server Actions consistently used `ensureProjectAccess`, AI tools (which are effectively public API endpoints) were inconsistently implementing these checks, often relying on the caller or assuming implied trust.
**Prevention:** ALL AI tools that perform write operations must explicitly verify ownership. Do not rely on read-access checks (like `getProjectByIdWithAccess` returning a public project) for write operations; explicitly check `project.userId === session.user.id`.

## 2024-05-22 - [IDOR in Document Updates]
**Vulnerability:** `updateDocument` tool allowed updating any document by ID without verifying that the `userId` on the document matches the session user.
**Learning:** `getDocumentById` retrieves documents by ID globally. Even if the tool gets the document, it must explicitly verify `document.userId === session.user.id` before allowing updates. Using `getProjectByIdWithAccess` for write operations is also dangerous if it includes public projects.
**Prevention:** Always verify `entity.userId === session.user.id` (or `project.userId` for project-child entities) before any write operation.
