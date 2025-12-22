# Agent and Contributor Guidelines

This document serves as the **Single Source of Truth** for all agents and contributors working on the AI Book World Builder project.

## Core Principles

1.  **Performance First**: Prioritize efficient code (Server Components, optimized images, minimal client-side bundles).
2.  **Type Safety**: **Strict TypeScript usage is mandatory.** usage of `any` is strictly prohibited.
3.  **Accessibility**: Interactive elements must be keyboard accessible, labeled, and testable via `axe-core`.
4.  **Design System**: Strict adherence to the [Native macOS Aesthetic](docs/design-system.md) and shadcn/ui tokens.
5.  **Testing & Documentation**: No code is complete without tests (Unit + E2E + Visual) and documentation.

## Critical Technical Rules

### 1. Dynamic Imports for Shared Libraries
Shared library files (e.g., in `lib/`) that use Node.js modules like `fs` **MUST** use dynamic imports and environment checks (`typeof window === 'undefined'`) to ensure compatibility with Client Components.
- *Why*: Importing Node.js modules directly in files used by Client Components causes build failures.

### 2. Strict Type Safety
- **No `any`**: You must properly type all variables and function returns.
- **Explicit Returns**: Exported functions should have explicit return types.
- **Generics**: Use generics for reusable components/utilities.

### 3. Server Action Security
- **Ownership Verification**: All Server Actions accessing user data must verify ownership (e.g., `getProjectByIdWithAccess`).
- **Boundary Enforcement**: Pass parent IDs (e.g., `projectId`) to DB queries to prevent IDOR.

## Verification Strategy

> [!IMPORTANT]
> You must perform **BOTH** types of verification before marking a task as complete.

### 1. Functional & CI Verification (TypeScript)
Run the project's test suite to ensure logic correctness and prevent regressions.
- **Type Check**: `pnpm type-check`
- **Unit**: `pnpm exec vitest run`
- **E2E/Integration**: `pnpm exec playwright test`
- **Reference**: `docs/testing.md`

### 2. Visual Verification (Python)
Use Python scripts with Playwright (typically in `verification/`) to generate screenshots of your changes.
- **Purpose**: Visually verify that UI changes match the "Native macOS" aesthetic and don't break layout.
- **Action**: Create a script if one doesn't exist for your feature.

## Design System

Adhere to the **Native macOS** aesthetic defined in [`docs/design-system.md`](docs/design-system.md).
- **Roundedness**: `rounded-lg` (16px) for buttons/inputs, `rounded-2xl` for dialogs.
- **Materials**: Use `.glass` or `.glass-panel` for translucency.
- **Motion**: Use spring physics (stiffness: 400, damping: 25) for animations.

## Agent Workflow

1.  **Plan**: Analyze requirements. Check `docs/` and `.agent/` guidelines.
2.  **Implement**: Write code following specific workflows (see below).
3.  **Verify**:
    *   Run `pnpm lint` and `pnpm format` (using `ultracite`).
    *   Run `pnpm type-check` (TypeScript Linter).
    *   Run `pnpm test` (Unit/E2E).
    *   Run `pnpm storybook` to visually check components if modifying UI. Ensure `globals.css` styles are applied and addons (Accessibility, Controls) are working.
    *   Run Python visual verification scripts.
4.  **Document**: Update JSDoc, READMEs, and `.agent` docs.
5.  **Reflect**:
    *   **MANDATORY**: Log critical UX, accessibility, or architectural learnings in `.AgentName/palette.md` (e.g., `.Jules/palette.md`).
    *   Format: `## YYYY-MM-DD - [Title]`.

## Agent Resources

### 📚 Guidelines
- [Next.js Patterns](.agent/guidelines/nextjs-patterns.md): Server vs Client components, Route Handlers.
- [React Patterns](.agent/guidelines/react-patterns.md): Hooks, composition, state management.
- [Database Patterns](.agent/guidelines/database-patterns.md): Drizzle ORM, schema design.
- [AI Integration](.agent/guidelines/ai-integration.md): Vercel AI SDK, streaming, tools.

### 🛠 Workflows
- [Setup Dev Environment](.agent/workflows/setup-dev.md)
- [Add Feature](.agent/workflows/add-feature.md)
- [Debug Issue](.agent/workflows/debug-issue.md)
- [Refactor Code](.agent/workflows/refactor-code.md)
- [Optimize Performance](.agent/workflows/optimize-performance.md)

### 📖 Context
- [Project Overview](.agent/context/project-overview.md)
- [Conventions](.agent/context/conventions.md)
