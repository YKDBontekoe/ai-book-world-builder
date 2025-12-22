## 2024-05-22 - React Context Re-renders
**Learning:** `useContext` hooks (like `useDataStream`) trigger re-renders in every consuming component on every update. Calling such a hook without using its value (as seen in `messages.tsx`) is a silent performance killer.
**Action:** Always check hooks for hidden context subscriptions. Isolate frequent updates (like streaming data) to small leaf components to prevent heavy parent re-renders.

## 2024-05-23 - Context Splitting for Performance
**Learning:** Large monolithic Contexts (like BookCanvasContext) cause massive re-renders in heavy consumers (Chat) even when they only need setters. Splitting into Value/Actions contexts allows consumers to subscribe only to what they need, significantly reducing re-renders.
**Action:** When designing global contexts, always separate Actions (stable) from State (frequent updates) into two Providers. Use separate hooks (useActions, useValue) to allow granular subscription.

## 2024-05-24 - Bundle Splitting for Tool Renderers
**Learning:** `ToolRenderer` used static imports for all tool widgets, causing the initial chat bundle to include all widgets (Generation, Scene, Entity editors). This is inefficient as most chats don't use all tools immediately.
**Action:** Converted to `next/dynamic` imports with `Skeleton` fallback. This significantly reduces TTI. Also learned that testing `next/dynamic` in `jsdom` requires mocking `next/dynamic` to ensure components load, and verifying loading state works.

## 2024-05-25 - O(N*M) Lookup Optimization
**Learning:** Using `Array.find()` inside a `map` loop (e.g., matching votes to messages) creates O(N*M) complexity. While N is small, this pattern scales poorly and runs on every render.
**Action:** Pre-compute a lookup `Map` (O(N)) using `useMemo` so that the inner loop lookup becomes O(1), reducing total complexity to O(N).

## 2024-05-25 - Vitest Alias Resolution
**Learning:** Vitest environment often fails to resolve aliases (`@/`) in source files if they are not explicitly mapped correctly in the test config or if the environment is complex.
**Action:** Using relative imports in shared component libraries is a robust workaround to ensure tests pass reliably without complex config debugging.

## 2024-05-30 - Deep Equality in Memoization
**Learning:** `fast-deep-equal` in a `memo` comparison function runs on every parent re-render. For a list of N messages updating frequently (streaming), checking deep equality for all N-1 stable messages is O(N*M) waste. Checking reference equality (`prev.message === next.message`) first avoids this.
**Action:** In `memo` comparison functions, always check reference equality of large objects before falling back to deep equality. Also ensure all props that affect rendering (like `isLast`) are actually checked.

## 2025-12-21 - Editor Re-initialization
**Learning:** `useEffect` with `[content]` dependency in `PureEditor` caused the entire Prosemirror instance (`EditorView`) to be destroyed and recreated on every keystroke. This happens because the effect's cleanup function destroys the instance, and the effect runs whenever `content` prop changes.
**Action:** For complex imperative integrations (like Prosemirror), use `[]` dependency for the initialization effect. Handle updates in a separate effect that synchronizes props to the instance methods (like `setProps` or `dispatch`). Ensure to suppress exhaustive-deps lint rule with a clear explanation.

## 2025-02-18 - Unstable Custom Hook Returns
**Learning:** Custom hooks that return new object literals on every render cause all consumers (like Context Providers) to trigger re-renders, even if the internal state hasn't changed. This nullifies `useMemo` in parent components and cascades re-renders to all context consumers.
**Action:** Always memoize the return object of custom hooks using `useMemo` if the hook is meant to provide stable values to contexts or memoized children.
