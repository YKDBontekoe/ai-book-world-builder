# Security & Quality Audit Report

## 🔴 [Severity: Critical] - Unprotected Server Actions (Open AI Relay)

**The Bug:**
The file `src/features/writer/actions/ai.ts` exports `async function`s marked with `"use server"` that lack any authentication, authorization, or quota checks. These functions (`continueWriting`, `draftScene`, etc.) directly call the `generationService`.

**The Impact:**
These endpoints act as an open relay for the AI Service. Any user (or bot, if the endpoint is discovered) can invoke these functions to generate text, bypassing all usage limits and costing the platform money (API billing). This is a "Billing Denial of Service" vulnerability.

**The Fix:**
Wrap all actions using `createUserAction` from `@/lib/action-middleware` to enforce authentication. Add Zod validation and a quota check.

```typescript
// src/features/writer/actions/ai.ts
"use server";

import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { generationService } from "@/lib/ai/services";
import { checkUsageQuota } from "@/lib/quota";

const continueWritingSchema = z.object({
  context: z.string().max(20000), // Enforce limits
  previousContent: z.string().max(10000),
  options: z.object({
    modelId: z.string().optional(),
    temperature: z.number().optional(),
    style: z.string().optional(),
  }).optional(),
});

export const continueWriting = createUserAction({
  input: continueWritingSchema,
  handler: async ({ user, input }) => {
    const hasQuota = await checkUsageQuota(user.id);
    if (!hasQuota) throw new Error("Usage quota exceeded");

    return generationService.continueWriting(
      input.context,
      input.previousContent,
      input.options
    );
  },
});
```

---

## 🔴 [Severity: High] - Broken Usage Quota Logic (Denial of Service)

**The Bug:**
The `checkUsageQuota` function in `src/lib/quota.ts` defaults to returning `false` in production environments if the environment variable `ALLOW_UNIMPLEMENTED_QUOTA` is not set.

**The Impact:**
Upon deployment to production, **all users** will be blocked from generating content, rendering the core feature of the application broken.

**The Fix:**
Update the default behavior to `true` (allow access) until a real quota system is implemented, or implement a basic DB check.

```typescript
// src/lib/quota.ts
export async function checkUsageQuota(userId: string): Promise<boolean> {
    if (!userId) return false;
    // Allow by default until quota system is live
    return true;
}
```

---

## 🟡 [Severity: Medium] - Missing Input Validation on AI Inputs

**The Bug:**
The AI actions accept raw strings (`context`, `previousContent`) without length limits.

**The Impact:**
A malicious user could send megabytes of text in the `context` field. Depending on the LLM provider, this could either crash the server (memory), cause a timeout, or incur massive costs if the provider charges by token and accepts large contexts (up to 200k tokens).

**The Fix:**
Implement strict Zod schemas with `.max()` string limits as shown in the Critical fix above.

---

## 🟢 [Severity: Low] - Inconsistent Cache Invalidation

**The Bug:**
`ProjectService.deleteProjects` performs a cascading delete but does not invalidate the cache (Redis or Next.js Cache). It relies on the caller to do so.

**The Impact:**
If a new caller (e.g., a background job or a new API route) uses this service without manually invalidating the cache, the application state will become inconsistent (deleted projects appearing in lists).

**The Fix:**
Ideally, the Service should return the list of affected Project IDs, and the Action should invalidate them, or the Service should accept a flag to invalidate. For now, ensuring all Actions call `revalidatePath` is sufficient but brittle.
