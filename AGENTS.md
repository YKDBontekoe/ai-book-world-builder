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

## The "Testing-First" Mandate

We follow a strict testing hierarchy to balance speed and confidence ("The Testing Trophy"):

1.  **Integration (Highest Priority)**: Test the interaction between multiple components/hooks using MSW for data fetching.
2.  **Unit**: For complex utility functions or isolated logic.
3.  **Visual/Interaction**: Write/update Storybook stories and use play functions for interaction testing.
4.  **E2E**: Critical user journeys (Login, Checkout, Onboarding) using Playwright.

### Implementation Rules

1.  **Accessibility First**: Never use `container.querySelector` or class-based selectors. Use `screen.getByRole`, `screen.getByLabelText`, etc.
2.  **MSW Patterns**: When a component fetches data, do not `vi.mock` the fetch call. Instead, provide an msw handler in a `src/mocks/handlers.ts` file or local to the test.
3.  **Storybook-to-Test Pipeline**: When creating a new component, always create a `.stories.tsx` file. Use Storybook's play function to simulate interactions, as these can be run by Vitest.
4.  **Next.js Specifics**:
    *   Mock `next/navigation` using the standardized mock-next-router patterns.
    *   For Server Components, focus on logic extraction into testable units or E2E coverage.

### Workflow Logic

1.  **Identify Contract**: Look at the component props and data requirements.
2.  **Define Handlers**: If it fetches data, write the MSW handlers first.
3.  **Draft the Story**: Create the Storybook file to visualize states (Loading, Success, Error).
4.  **Write the Vitest Suite**: Use `@testing-library/react`. Mirror the file structure: `tests/unit/[path_to_component].test.tsx`.
5.  **Verify**: Ensure the test handles the "Happy Path" and at least two edge cases (e.g., API 500 error, empty state).

## Verification Strategy

> [!IMPORTANT]
> You must perform **BOTH** types of verification before marking a task as complete.

### 1. Functional & CI Verification (TypeScript)
Run the project's test suite to ensure logic correctness and prevent regressions.
- **Type Check**: `pnpm type-check`
- **Unit**: `pnpm exec vitest run`
- **E2E/Integration**: `pnpm exec playwright test`
- **Reference**: `docs/testing.md`

### 2. Visual & Interaction Verification (Storybook)
Create and run Storybook stories for UI components to verify states and interactions.
- **Purpose**: Visually verify UI states (Loading, Success, Error) and interactions (via play functions).
- **Action**: Create a `.stories.tsx` file for every new component.
- **Command**: `pnpm storybook`

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
    *   Run `pnpm test:unit` and `pnpm test:e2e` as needed.
    *   Run `pnpm storybook` to visually check components if modifying UI. Ensure `globals.css` styles are applied and addons (Accessibility, Controls) are working.
4.  **Document**: Update JSDoc, READMEs, and `.agent` docs.
5.  **Reflect**:
    *   **MANDATORY**: Log critical UX, accessibility, or architectural learnings in `.AgentName/palette.md` (e.g., `.Jules/palette.md`).
    *   Format: `## YYYY-MM-DD - [Title]`.

## Code Review & PR Process

- **CodeRabbitAI Bot**: You must always evaluate and respond to comments from `coderabbitai[bot]` on PR reviews. Address the feedback or explain why it is not applicable.

## Automated Agentic Workflow

This project uses a fully automated CI/CD pipeline with AI agents. See [docs/agentic-workflow.md](docs/agentic-workflow.md) for complete details.

### Key Automation Features

| Feature | Description |
|---------|-------------|
| **Issue-to-PR** | Label an issue with `jules` to have Jules create a PR |
| **CodeRabbit Review** | All PRs are automatically reviewed by CodeRabbit |
| **Jules Fixes Feedback** | Jules automatically addresses CodeRabbit comments |
| **CI Auto-Fix** | Jules automatically fixes failing CI checks |
| **Auto-Merge** | Safe PRs (deps, docs) auto-merge when CI passes |
| **Security Scans** | Nightly vulnerability scans with auto-fix |

### Triggering Jules

```markdown
# Via Label
Add the "jules" label to any issue

# Via Comment
@jules please implement this feature
@jules fix this bug
@jules investigate this error
```

### Auto-Merge Candidates

PRs with these characteristics are auto-merged:
- Dependency updates (Renovate/Dependabot)
- Small documentation changes
- PRs labeled `auto-merge-candidate`


## Agent Resources

### 🤖 Personas
- [Testing Agent](.agent/personas/testing-agent.md): Senior SDET, Testing Trophy, MSW/Vitest/Storybook focus.

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
