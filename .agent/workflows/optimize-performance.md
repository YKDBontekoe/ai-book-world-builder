---
description: Optimize application performance
---

# Performance Optimization Workflow

Follow this systematic approach to identify and fix performance bottlenecks.

## Principle: Measure First, Optimize Second

**Never optimize without measuring!** Always profile before and after to verify improvements.

## Phase 1: Establish Baseline

### 1. Identify Performance Goals

Define what "good performance" means:
- [ ] Page load time targets (e.g., < 2s)
- [ ] Time to Interactive (TTI) targets
- [ ] Core Web Vitals targets (LCP, FID, CLS)
- [ ] API response time targets
- [ ] Database query time targets

### 2. Measure Current Performance

**Frontend Performance:**
```bash
# Use Lighthouse in Chrome DevTools
# Or run from CLI
npx lighthouse http://localhost:3000 --view

# Check Core Web Vitals
# Use Chrome DevTools > Performance tab
# Record user interaction and analyze
```

**Backend Performance:**
```bash
# Add timing logs to API routes
console.time('API /api/chat');
// ... route logic
console.timeEnd('API /api/chat');

# Monitor database query times
# Check server response times
```

### 3. Document Baseline Metrics

```markdown
## Performance Baseline
- First Contentful Paint: 1.2s
- Largest Contentful Paint: 2.8s
- Time to Interactive: 3.5s
- Total Blocking Time: 450ms
- Cumulative Layout Shift: 0.15
- API response time: 850ms
- Database query time: 120ms
```

## Phase 2: Identify Bottlenecks

### 1. Frontend Profiling

**React DevTools Profiler:**
```typescript
// Wrap components to profile
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

<Profiler id="Chat" onRender={onRenderCallback}>
  <Chat />
</Profiler>
```

**Chrome DevTools Performance:**
1. Open DevTools > Performance tab
2. Click Record
3. Interact with the app
4. Stop recording
5. Analyze flame graph for long tasks

**Common Frontend Bottlenecks:**
- [ ] Large bundle sizes
- [ ] Unnecessary re-renders
- [ ] Expensive computations in render
- [ ] Large images without optimization
- [ ] Too many network requests
- [ ] Blocking JavaScript execution

### 2. Backend Profiling

**API Route Timing:**
```typescript
// app/api/chat/route.ts
export async function POST(request: Request) {
  const startTime = performance.now();
  
  // ... route logic
  
  const duration = performance.now() - startTime;
  console.log(`Chat API took ${duration}ms`);
  
  return response;
}
```

**Database Query Timing:**
```typescript
// lib/db/queries.ts
export async function getChatById(id: string) {
  const startTime = performance.now();
  
  const result = await db.query.chats.findFirst({
    where: eq(chats.id, id),
  });
  
  const duration = performance.now() - startTime;
  console.log(`Query getChatById took ${duration}ms`);
  
  return result;
}
```

**Common Backend Bottlenecks:**
- [ ] Slow database queries (missing indexes)
- [ ] N+1 query problems
- [ ] Synchronous operations blocking async flow
- [ ] Large payload processing
- [ ] Inefficient algorithms
- [ ] External API calls without caching

## Phase 3: Optimization Strategies

### Frontend Optimizations

#### 1. Code Splitting and Lazy Loading

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Disable SSR if not needed
});

// Route-based code splitting (automatic in Next.js App Router)
// Each page in app/ directory is automatically code-split
```

#### 2. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur" // Optional blur-up effect
/>

// For dynamic images
<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  loading="lazy" // Lazy load below-fold images
/>
```

#### 3. Reduce Re-renders

```typescript
// Use React.memo for expensive components
import { memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Component logic
});

// Use useMemo for expensive computations
import { useMemo } from 'react';

function DataTable({ items }) {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.value - b.value),
    [items]
  );
  
  return <Table data={sortedItems} />;
}

// Use useCallback for stable function references
import { useCallback } from 'react';

function Parent() {
  const handleClick = useCallback(() => {
    // Handler logic
  }, []); // Dependencies
  
  return <Child onClick={handleClick} />;
}
```

#### 4. Optimize Bundle Size

```bash
# Analyze bundle
pnpm build
pnpm exec @next/bundle-analyzer

# Remove unused dependencies
pnpm exec depcheck

# Use tree-shakeable imports
// ❌ Bad
import _ from 'lodash';

// ✅ Good
import debounce from 'lodash/debounce';
```

#### 5. Prefetch and Preload

```typescript
// Prefetch routes on hover
import Link from 'next/link';

<Link href="/dashboard" prefetch>
  Dashboard
</Link>

// Preload critical resources
// In app/layout.tsx or page metadata
export const metadata = {
  other: {
    preload: [
      { href: '/fonts/geist.woff2', as: 'font', type: 'font/woff2' },
    ],
  },
};
```

### Backend Optimizations

#### 1. Database Query Optimization

```typescript
// Add indexes for frequently queried columns
// In lib/db/schema.ts
export const chats = pgTable('chats', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// Use select to fetch only needed columns
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  columns: {
    id: true,
    name: true,
    email: true,
    // Don't fetch unnecessary columns
  },
});

// Avoid N+1 queries with joins
const chatsWithMessages = await db.query.chats.findMany({
  with: {
    messages: true, // Drizzle will join efficiently
  },
});
```

#### 2. Caching Strategies

```typescript
// Use Next.js cache for data fetching
import { unstable_cache } from 'next/cache';

const getCachedUser = unstable_cache(
  async (userId: string) => {
    return await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  },
  ['user-by-id'],
  { revalidate: 3600 } // Cache for 1 hour
);

// Use React cache for request deduplication
import { cache } from 'react';

const getUser = cache(async (userId: string) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
});

// Multiple calls in same request will only execute once
```

#### 3. Streaming and Pagination

```typescript
// Stream large responses
import { streamText } from 'ai';

export async function POST(request: Request) {
  const stream = await streamText({
    model: selectedModel,
    messages,
  });
  
  return stream.toDataStreamResponse();
}

// Paginate large datasets
export async function getChats(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  
  return await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    limit,
    offset,
    orderBy: desc(chats.createdAt),
  });
}
```

#### 4. Parallel Processing

```typescript
// Execute independent operations in parallel
const [user, chats, documents] = await Promise.all([
  getUser(userId),
  getChats(userId),
  getDocuments(userId),
]);

// Use Promise.allSettled for operations that might fail
const results = await Promise.allSettled([
  fetchUserData(),
  fetchAnalytics(),
  fetchRecommendations(),
]);
```

### Next.js Specific Optimizations

#### 1. Use Server Components by Default

```typescript
// Server Component (default) - no 'use client'
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId); // Direct DB access
  
  return <div>{user.name}</div>;
}

// Only use Client Components when needed
'use client';

import { useState } from 'react';

function InteractiveWidget() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 2. Optimize Metadata

```typescript
// app/page.tsx
export const metadata = {
  title: 'AI Book World Builder',
  description: 'Create immersive book worlds with AI',
  openGraph: {
    title: 'AI Book World Builder',
    description: 'Create immersive book worlds with AI',
    images: ['/og-image.jpg'],
  },
};
```

#### 3. Use Partial Prerendering (PPR)

```typescript
// next.config.ts
const config = {
  experimental: {
    ppr: true, // Enable Partial Prerendering
  },
};
```

## Phase 4: Measure Improvements

### 1. Run Performance Tests Again

```bash
# Frontend
npx lighthouse http://localhost:3000 --view

# Compare with baseline metrics
```

### 2. A/B Testing

```typescript
// Test optimized vs unoptimized versions
// Measure real user metrics
// Use feature flags to gradually roll out
```

### 3. Monitor in Production

```typescript
// Use Web Vitals reporting
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Phase 5: Verification

### 1. Performance Checklist

- [ ] Lighthouse score improved
- [ ] Core Web Vitals within targets
- [ ] Bundle size reduced
- [ ] API response times improved
- [ ] Database query times reduced
- [ ] No functionality broken
- [ ] Tests still passing

### 2. Document Improvements

```markdown
## Performance Improvements
- Reduced bundle size by 40% (800KB → 480KB)
- Improved LCP from 2.8s to 1.2s
- Reduced API response time from 850ms to 320ms
- Added database indexes, reducing query time from 120ms to 25ms
```

## Common Performance Wins

### Quick Wins (Low Effort, High Impact)

1. **Add missing database indexes**
2. **Optimize images with Next.js Image**
3. **Enable compression** (automatic in Next.js)
4. **Remove unused dependencies**
5. **Use Server Components by default**
6. **Add caching headers**
7. **Lazy load below-fold content**

### Medium Effort

1. **Code splitting for large components**
2. **Implement pagination**
3. **Add request caching**
4. **Optimize database queries**
5. **Reduce re-renders with memo/useMemo**

### High Effort

1. **Implement CDN for static assets**
2. **Add service worker for offline support**
3. **Implement virtual scrolling for large lists**
4. **Optimize critical rendering path**
5. **Implement edge caching**

## Performance Budget

Set and enforce performance budgets:

```javascript
// next.config.ts
const config = {
  webpack: (config) => {
    config.performance = {
      maxAssetSize: 512000, // 500 KB
      maxEntrypointSize: 512000,
    };
    return config;
  },
};
```

## Tools and Resources

```bash
# Performance analysis
npx lighthouse http://localhost:3000
npx @next/bundle-analyzer

# Dependency analysis
npx depcheck
npx npm-check-updates

# Code complexity
npx complexity-report

# Visual regression testing
npx playwright test --project=visual
```
