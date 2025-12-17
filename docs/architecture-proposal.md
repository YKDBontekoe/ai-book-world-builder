# Architecture Proposal: Feature-Based Directory Structure

## Overview
This document proposes a transition from the current layer-based structure (components/ui, components/feature) to a domain-driven, feature-based architecture. This aligns with Next.js App Router best practices for scalability and code collocation.

## Current Structure
Currently, components are grouped by type in the root `components/` directory:
```
components/
  ui/           (Shared primitives)
  writer/       (Writer feature components)
  chat/         (Chat feature components)
  book-canvas/  (Visualization components)
  ...
```

## Proposed Structure
We propose moving to a top-level `features/` directory (or `src/features/`), where each domain has its own self-contained module.

```
src/
  features/
    writer/
      components/
        WriterView.tsx
        SceneNavigation.tsx
      hooks/
        useWriterState.ts
      actions/
        writer-actions.ts
      utils/
    chat/
      components/
        ChatInterface.tsx
        MessageList.tsx
      hooks/
        useChat.ts
    library/  (Projects list)
      components/
        ProjectList.tsx
  components/
    ui/         (Shared design system primitives like Button, Card)
    layout/     (Shared layout components like Sidebar)
  lib/          (Shared utilities, db, types)
  app/          (Thin routing layer, imports from features/)
```

## Benefits

1.  **Collocation**: Related code (UI, state, actions) sits together. This makes it easier to modify a feature without jumping between `app/actions`, `hooks/`, and `components/`.
2.  **Explicit Boundaries**: Dependencies between features become explicit. Imports like `@/features/writer` are clearer than deep imports.
3.  **Scalability**: As the application grows, the root `components/` folder won't become cluttered.
4.  **Bundle Optimization**: It's easier to identify which code belongs to which route, aiding in code splitting.

## Implementation Plan (Phased)

1.  **Phase 1**: Create `features/` directory and move `writer` components.
2.  **Phase 2**: Move `useWriterState` and `actions/writer.ts` into `features/writer`.
3.  **Phase 3**: Repeat for `chat` and `book-canvas`.
4.  **Phase 4**: Update all imports and verify tests.

This structure is purely organizational and does not change the runtime behavior, but significantly improves developer experience and maintainability.
