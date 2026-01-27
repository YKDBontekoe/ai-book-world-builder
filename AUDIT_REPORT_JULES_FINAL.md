# Security & Code Quality Audit Report

**Auditor:** Jules (Senior Next.js Security Researcher)
**Date:** May 2024
**Scope:** Server Actions, Factory Tycoon Feature, Quota Logic

## Executive Summary

Three critical issues were identified during this audit cycle. The most severe is a potential Denial of Service (DoS) vector in the Admin Action `listJulesSourcesAction`, which attempts to fetch up to 1,000 pages of data in a single request loop. Additionally, significant performance bottlenecks were found in the Factory Tycoon game loop, and the billing quota system remains a stub in production.

## Detailed Findings

### 1. 🔴 [Severity: High] - Unbounded Resource Consumption (DoS)

**Location:** `src/app/actions/jules.ts` (`listJulesSourcesAction`)

**The Bug:**
The action iterates through paginated API results to aggregate *all* sources into a single response. It has a `MAX_PAGES` constant set to `1000`.
```typescript
const MAX_PAGES = 1000;
// ...
do {
    // ... fetch ...
} while (pageToken);
```
If the upstream API returns 50 items per page, this attempts to load 50,000 items into memory. This will almost certainly trigger a Vercel Serverless Function Timeout (10s limit on Hobby, 60s on Pro) or an Out of Memory (OOM) error, effectively crashing the admin panel for this feature.

**The Impact:**
Denial of Service for administrators trying to list sources. Potential cost spike if the upstream API charges per call.

**The Fix:**
Reduce `MAX_PAGES` to a safe limit (e.g., 20) and encourage the implementation of client-side pagination.

---

### 2. 🟠 [Severity: Medium] - Production Billing Bypass

**Location:** `src/lib/quota.ts`

**The Bug:**
The `checkUsageQuota` function returns `true` unconditionally, with only a `console.warn`.
```typescript
export async function checkUsageQuota(userId: string): Promise<boolean> {
    // ...
    console.warn(...);
    return true;
}
```

**The Impact:**
If deployed to production, this allows unlimited AI usage, bypassing any intended billing limits.

**The Fix:**
Add an explicit check for `process.env.NODE_ENV === 'production'` to log a cleaner error or enforce a "fail-safe" (return `false`) if strict mode is desired.

---

### 3. 🟡 [Severity: Medium] - React Performance Bottleneck

**Location:** `src/features/factory-tycoon/store.tsx`

**The Bug:**
The `manualInteract` callback depends on `state.buildings`.
```typescript
const manualInteract = useCallback((x, y) => {
    // ...
}, [state.buildings]);
```
Since the game loop updates `state` (and thus `buildings`) on every tick (e.g., 10-60 times/second), this function is recreated every tick. This forces all child components receiving it (e.g., Grid Tiles) to re-render constantly, destroying performance.

**The Impact:**
High CPU usage, frame drops, and battery drain on client devices.

**The Fix:**
Utilize the existing `stateRef` to access the latest state inside the callback without adding it to the dependency array. This makes the function reference stable.

## Auditor Notes

The codebase is generally well-structured with strong Zod validation in Server Actions. The identified issues are primarily related to scaling limits and real-time performance optimization.
