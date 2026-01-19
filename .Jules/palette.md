## 2026-01-18 - Mobile admin layouts favor stacked controls

### Context

Admin pages relied on dense horizontal layouts that became cramped on small screens, especially the user list and GitHub controls.

### Solution

Shifted admin layouts to stacked headings, wrapped action controls, and introduced a mobile card view for the users list while keeping the desktop table.

### Outcome

Admin views remain readable on mobile with touch-friendly controls and preserved desktop density.

### Learnings

- Provide alternate mobile structures (cards vs. tables) to keep data readable without horizontal scrolling.

## 2026-01-08 - Replaced Raw Loading Text with Skeletons

### Context

The `ItemDetail` and `CommentSection` components in the GitHub admin interface were using raw `<div>Loading...</div>` text, which broke the "Native macOS" aesthetic.

### Solution

Created specific Skeleton components (`ItemDetailSkeleton` and `CommentSectionSkeleton`) that mirror the layout of the actual components using `GlassCard` and `Skeleton` atoms.

### Outcome

Loading states now transition smoothly and match the rest of the application's design language.

### Learnings

- Always look for opportunities to replace raw loading text with high-fidelity skeletons.
- Skeletons should use `GlassCard` variants to match the container they are loading into.

## 2026-01-10 - Writer Header Responsive Grouping

### Context

The writer header contained dense metrics and status chips in a single row, squeezing the scene title on smaller screens.

### Solution

Split the header into primary and secondary rows, moving metrics, goals, insights, and save/snapshot status into a dedicated secondary row with a mobile "More" menu fallback.

### Outcome

The scene title gains more horizontal space while secondary details remain accessible across breakpoints.

### Learnings

- Group secondary metadata into responsive rows or menus to preserve primary navigation clarity on compact layouts.

## 2026-01-10 - Added SQLite Driver Support

### Context

Local development and unit tests needed a lightweight database option without requiring Postgres.

### Solution

Implemented a DB driver switch with a SQLite schema layer and a bootstrap script to initialize a local `.sqlite` file with seed data.

### Outcome

Developers can now run the app against SQLite by toggling `DB_DRIVER` and initializing the database with the mock bootstrap script.

### Learnings

- Keep DB driver selection centralized so server actions and repositories always follow the active driver.

## 2026-01-10 - Mobile overlays preserve editor focus

### Context

The writer layout now uses overlay sheets for navigation and canvas on mobile to avoid shrinking the editor space.

### Solution

Keep the editor as the full-height primary surface while sliding sidebar/canvas panels in as translucent sheets.

### Outcome

Mobile writing stays focused and visually consistent with the macOS glass aesthetic.

### Learnings

- Mobile panels should be overlays so the editor remains the dominant surface.

## 2026-01-11 - Passkey onboarding for auth flows

### Context

Login and registration needed a stronger passwordless option without breaking existing credentials-based sign-in.

### Solution

Added passkey registration and authentication flows with WebAuthn-backed challenges, plus UI hooks on the auth screens to create and use passkeys.

### Outcome

Users can generate a passkey after signup and sign in without passwords, while preserving the existing credential login path.

### Learnings

- Always store WebAuthn challenges server-side with short expirations to prevent replay.
- Keep passkey buttons alongside existing auth methods to avoid blocking users on unsupported devices.

## 2026-01-12 - AI assist panels favor structured, source-backed output

### Context

New AI writing helpers needed to feel trustworthy and immediately actionable inside the editor.

### Solution

Presented co-author alternatives as discrete, labeled options and formatted manuscript answers with explicit source excerpts so writers can validate suggestions quickly.

### Outcome

AI responses now read like editorial notes rather than opaque generations, improving adoption and confidence.

### Learnings

- Structured, labeled alternatives are faster to evaluate than a single long rewrite.
- Source-backed answers reduce the cognitive load when verifying AI guidance.

## 2025-02-14 - Session metadata keeps branch context visible

### Context
The new Jules console needed to keep the selected repository and base branch visible throughout a session while also reflecting Octogit PR status updates in chat.

### Solution
Persisted repository/branch metadata alongside the session, reused it in the chat header and PR cards, and surfaced Octogit failures as recoverable system messages.

### Outcome
Admins can confirm the active repo/branch at a glance, while PR status and errors remain part of the chronological timeline.

### Learnings
- Persisting session metadata locally keeps client UI deterministic even when upstream APIs lag.
- System messages with retry affordances reduce confusion when background polling fails.

## 2025-02-14 - Octogit replaces Octokit for admin GitHub actions

### Context
The admin GitHub actions still depended on the Octokit SDK, which conflicted with the requirement to route GitHub access exclusively through Octogit.

### Solution
Refactored GitHub server actions to use Octogit endpoints for issues, PRs, comments, and repo stats while expanding the Octogit client to cover required API calls.

### Outcome
All GitHub data used by the admin interface now flows through Octogit, keeping SDK usage out of the codebase and consolidating API behavior.

### Learnings
- Centralizing GitHub access through Octogit avoids mixing SDK patterns and keeps security boundaries clear.
- Extending shared clients with typed helpers prevents reintroducing forbidden dependencies.

## 2025-02-14 - Reverted admin GitHub flows to Octokit

### Context
The admin console needed to drop the custom Octogit client and rely on the first-party Octokit SDK instead.

### Solution
Removed Octogit actions and replaced repository, branch, PR, and status helpers with Octokit-backed server actions and shared GitHub types.

### Outcome
All admin GitHub interactions now flow through Octokit while preserving the Jules console workflows.

### Learnings
- Centralizing GitHub calls in Octokit keeps admin flows aligned with upstream APIs.
- Shared UI types should live outside server actions for reuse across client components.

## 2026-01-18 - Prompt placeholder replacement uses literal tokens

### Context

The supervisor prompt builder returned literal placeholders like `$BATCHED_COMMENTS` because the regex treated `$` as an end-of-line anchor.

### Solution

Switched to string-based `replaceAll` so placeholder tokens are replaced literally without regex escaping pitfalls.

### Outcome

Jules API prompts now receive the actual batched feedback instead of the raw placeholder token.

### Learnings

- Prefer string replacement APIs for tokenized prompt templates to avoid regex metacharacter issues.

## 2025-02-15 - Jules console source/scroll resilience

### Context

The Jules console struggled to map selected repositories to sources and had jerky scrolling on mobile layouts.

### Solution

Paginated the Jules source listing, matched sources case-insensitively to repositories, and made the chat layout rely on flexible height constraints instead of fixed pixel heights.

### Outcome

Repository sources resolve reliably across larger source lists, and the chat viewport scrolls smoothly on smaller screens.

### Learnings

- Always page through external source catalogs to avoid silent mismatches.
- Mobile scroll areas behave better when parent containers use min-height constraints and flexible sizing.
