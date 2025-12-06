# Coding Conventions

This document outlines the coding conventions enforced in this project.

## Code Style

We use **Biome** (via `ultracite`) for formatting and linting.
- **Run Linter**: `pnpm lint`
- **Fix Issues**: `pnpm format`

### TypeScript
- **Strict Mode**: Enabled. No `any` allowed.
- **Types vs Interfaces**: Use `type` for simple definitions and union types; `interface` for object shapes that might need extending (though `type` is generally preferred for consistency in specific modules).
- **Exports**: Named exports preferred over default exports for utilities and components (except Next.js pages/layouts).

## Naming Conventions

### Files & Directories
- **kebab-case** for all files and directories: `user-profile.tsx`, `api/chat/route.ts`.
- **Exception**: Special Next.js files: `page.tsx`, `layout.tsx`, `loading.tsx`.

### Components
- **PascalCase** for component names: `UserProfile`, `ChatInput`.
- **Props Interface**: `[ComponentName]Props`.

### Database
- **Schema**: CamelCase for column definitions (transformed to snake_case in DB via Drizzle).
- **Tables**: specific naming in schema (e.g., `user`, `chat`).

## Import Ordering
Imports are automatically organized by Biome, but generally:
1. External dependencies (React, Next.js, AI SDK).
2. Internal aliases (`@/components`, `@/lib`).
3. Relative imports (`./utils`).

## State Management
1. **Server State**: Use Server Components for initial fetch.
2. **Client Fetching**: Use `swr` for polling or client-side updates.
3. **UI State**: `useState` / `useReducer` for local state.
4. **Global UI**: Zustand (if used) or Context for app-wide UI settings (theme, sidebar).

## Mandatory Verification
It is **required** that every change is:
1. **Tested**: Add unit/integration/e2e tests covering your changes.
2. **Documented**: Update JSDoc, READMEs, and `.agent` docs if architectural patterns change.

## Error Handling
- **API**: Return `ChatSDKError.toResponse()` for consistent error structures.
- **UI**: Use Error Boundaries (`error.tsx`) for page crashes.
- **Toasts**: Use `toast` for ephemeral user feedback errors.

## Git Commit Messages
Follow Conventional Commits:
- `feat: add new chat feature`
- `fix: resolve polling issue`
- `docs: update readme`
- `style: format code`
- `refactor: simplify hook logic`
