## 2025-12-13 - Context Hooks in List Items
**Learning:** Using `useDataStream` (context) inside `PreviewMessage` caused all rendered messages to re-render on every stream chunk, leading to severe performance degradation during generation. `memo` does not prevent context-triggered re-renders.
**Action:** Extract context-dependent logic into a small isolated component (`MessageStreamingSources`) and conditionally render it only when needed (e.g., `isLoading`), keeping the heavy list item component stable.
