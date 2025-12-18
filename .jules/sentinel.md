## 2024-05-22 - [Critical IDOR in Public Projects]
**Vulnerability:** Found that `updateEntityAction` and `deleteEntityAction` used `getProjectByIdWithAccess` which returns public projects regardless of ownership, allowing unauthorized modification of entities in public projects.
**Learning:** Functions that check "access" (read) are not sufficient for "modification" (write). Public visibility grants read access to everyone, but write access must be restricted to the owner.
**Prevention:** Always verify `project.userId === session.user.id` explicitly for write operations, even if `getProjectByIdWithAccess` returns a project.
