# Security & Quality Audit Report

**Auditor:** Jules (Senior Next.js Security Researcher)
**Date:** 2024-05-23

## Executive Summary

I have performed a rigorous audit of the codebase, focusing on Server Actions, API Routes, and Data Access patterns. The application demonstrates strong security fundamentals, particularly in `ai-operations.ts` where service layers enforce access control. However, I identified two critical issues requiring immediate remediation: an IDOR vulnerability in the Entity Viewer and a potential DoS vector in story generation inputs.

## Findings & Fixes

### 1. 🔴 [Severity: High] - Insecure Direct Object Reference (IDOR) in Entity Viewer

**Location:** `src/app/(studio)/projects/[id]/entities/[entityId]/page.tsx`

**The Bug:**
The Entity Viewer page fetched entity details directly from the database using the provided `entityId`, only verifying that the entity belonged to the `projectId` in the URL. It failed to verify that the **current user** had permission to view the project itself.

**The Impact:**
An attacker could view private entity details of any project if they could guess or obtain the Project ID and Entity ID, bypassing privacy controls.

**The Fix:**
I updated the page to verify project access using `getProjectByIdWithAccess` before fetching entity data.

```typescript
// Added Auth Check
const session = await auth();
const project = await getProjectByIdWithAccess({
    id: projectId,
    userId: session?.user?.id,
});

if (!project) {
    notFound();
}
```

### 2. 🟠 [Severity: Medium] - Unbounded Input Array (Potential DoS)

**Location:** `src/lib/services/schemas/story-schemas.ts`

**The Bug:**
The Zod schemas `bookPlanSchema` and `scenePlanSchema` validated the structure of chapters and scenes but did not enforce a maximum array length.

**The Impact:**
A malicious actor could submit a payload with thousands of chapters or scenes. This would bypass basic size limits and could cause:
- Database timeouts during transactional bulk inserts.
- High memory consumption on the server.
- Potential application crash (Denial of Service).

**The Fix:**
I added `.max()` constraints to the Zod schemas.

```typescript
// src/lib/services/schemas/story-schemas.ts
chapters: z.array(...).max(100, "Too many chapters")
scenes: z.array(...).max(50, "Too many scenes")
```

### 3. 🟡 [Severity: Low] - Performance Risk in Word Count

**Location:** `src/app/actions/project-preview.ts`

**The Issue:**
The word count calculation uses `regexp_split_to_array` on the `content` column within a SQL query.
```sql
COALESCE(sum(array_length(regexp_split_to_array(trim(${scene.content}), '\s+'), 1)), 0)
```
For projects with large word counts, this operation is CPU-intensive on the database.

**Recommendation:**
In the future, implement a `wordCount` integer column on the `scene` table and update it incrementally whenever the scene content is saved.

## Conclusion

The identified critical and medium severity issues have been remediated. The application architecture is generally robust, leveraging a service-layer pattern that centralizes authorization logic.
