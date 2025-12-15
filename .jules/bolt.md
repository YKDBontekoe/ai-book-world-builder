## 2024-05-22 - React Context Re-renders
**Learning:** `useContext` hooks (like `useDataStream`) trigger re-renders in every consuming component on every update. Calling such a hook without using its value (as seen in `messages.tsx`) is a silent performance killer.
**Action:** Always check hooks for hidden context subscriptions. Isolate frequent updates (like streaming data) to small leaf components to prevent heavy parent re-renders.

## 2024-05-23 - Context Splitting for Performance
**Learning:** Large monolithic Contexts (like BookCanvasContext) cause massive re-renders in heavy consumers (Chat) even when they only need setters. Splitting into Value/Actions contexts allows consumers to subscribe only to what they need, significantly reducing re-renders.
**Action:** When designing global contexts, always separate Actions (stable) from State (frequent updates) into two Providers. Use separate hooks (useActions, useValue) to allow granular subscription.

## 2024-05-24 - Bundle Splitting for Tool Renderers
**Learning:** `ToolRenderer` used static imports for all tool widgets, causing the initial chat bundle to include all widgets (Generation, Scene, Entity editors). This is inefficient as most chats don't use all tools immediately.
**Action:** Converted to `next/dynamic` imports with `Skeleton` fallback. This significantly reduces TTI. Also learned that testing `next/dynamic` in `jsdom` requires mocking `next/dynamic` to ensure components load, and verifying loading state works.
