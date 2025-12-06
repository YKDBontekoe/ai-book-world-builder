# Agent and Contributor Guidelines

## Core Principles
1. **Performance First**: Prioritize efficient code (Server Components, optimized images).
2. **Type Safety**: strict TypeScript usage; zero `any`.
3. **Accessibility**: Interactive elements must be keyboard accessible and labeled.
4. **Design System**: Strict adherence to shadcn/ui and Tailwind tokens.
5. **Testing & Documentation**: No code is complete without tests and documentation.

## Mandatory Requirements

> [!IMPORTANT]
> **Every change must be tested and documented.**
> 1. **Testing**: You must implement usage of the project's test strategy (`docs/testing.md`). All new features and bug fixes require corresponding tests (Unit, Integration, or E2E).
> 2. **Documentation**: You must update relevant documentation (JSDoc, README, `.agent` docs) to reflect your changes.

## Agent Resources
The `.agent` directory contains detailed guidelines and workflows. **ALWAYS** refer to these before starting a task.

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

## Development Process
1. **Plan**: Analyze requirements and check relevant guidelines.
2. **Implement**: Follow specific workflows (e.g., "Add Feature").
3. **Verify**: 
   - **Test**: Run `pnpm test` and ensure all tests pass. Write new tests for new code.
   - **Lint**: Run `pnpm lint` and `pnpm format`.
   - **Document**: Update all affected documentation.
4. **Review**: Self-review against checklist in workflows.

## Pull Request Policy
- Descriptions must follow the format defined in [Pull Request Message Format].
- **Testing coverage** must be included in the PR description.
- **Documentation updates** must be included in the PR.
- All CI checks (lint, build, test) must pass.
- Migrations must be verified locally.
