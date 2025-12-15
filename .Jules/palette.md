## 2025-05-23 - Multiverse Map Implementation
- **Playwright Visibility Checks**: When verifying interactive elements like buttons, `force=True` is often necessary if the element is inside a collapsed sidebar or technically "outside viewport" due to CSS transitions, even if logically clickable.
- **Graph Visualization**: Integrated `@xyflow/react` successfully. Using `dagre` for auto-layout requires transforming the node positions to match React Flow's top-left anchor, whereas Dagre uses center-center.
- **Unified Graph Data**: Syncing canonical DB tables (Scene) with a graph-specific table (TimelineNode) allows for a hybrid approach where the main story is preserved but branching is flexible.
