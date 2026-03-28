# Palette

## 2026-01-22 - CodeRabbit triggers require PAT-authored comments

### Context

Non-human PRs (like Jules-created branches) were posting review-trigger comments via the default GitHub Actions token, which can be ignored by downstream automations.

### Solution

Moved supervisor comments to the custom PAT and added an explicit CodeRabbit trigger on Jules-authored PR open events.

### Outcome

CodeRabbit reviews now start reliably for Jules PRs without relying on CI-only triggers.

### Learnings

- Use a PAT identity for automation comments that must trigger third-party bots.

## 2026-01-19 - Brainstorming states need visible error recovery

### Context

Admins reported that the roadmap brainstorm button appeared unresponsive when the AI action failed, because the UI only showed a neutral empty state.

### Solution

Added explicit error messaging and a retry affordance while clearing stale suggestions during a brainstorm request.

### Outcome

Failures are now visible and recoverable, making the roadmap feel responsive even when the AI service rejects a request.

### Learnings

- Always surface AI action failures near the trigger with a clear retry path to avoid "silent" UI stalls.

## 2026-01-19 - Persisted admin selections reduce setup friction

### Context

Admins had to reselect the Jules repository and base branch every visit, which slowed down session setup and encouraged mistakes.

### Solution

Stored the selected repository and base branch in user preferences and reapplied them when the Jules console loads.

### Outcome

Returning admins land on a ready-to-run configuration with fewer repeated clicks and less chance of choosing the wrong branch.

### Learnings

- Persisting admin defaults can remove repeated setup steps without cluttering the UI.

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

## 2026-01-10 - Supervisor Feedback Reliability

### Context
The agentic supervisor sometimes skipped CodeRabbit feedback or CI failure alerts when checks were still running, leaving PRs without timely remediation prompts.

### Solution
Removed CI/CodeRabbit blocking waits, added CodeRabbit review scoping to the latest review timestamp, and improved CI failure fallbacks plus token/permission resilience in the workflow.

### Outcome
CI failures and CodeRabbit reviews now trigger immediate, deterministic feedback posts with clearer notes when CI or CodeRabbit is still running.

### Learnings
- Feedback batching should never block on unrelated checks; include pending-status notes instead of skipping notifications.

## 2026-01-10 - Bot Identity Allowlists

### Context
Supervisor reliability depended on correct bot login matching, but hardcoded strings made it easy to drift as GitHub app usernames evolve.

### Solution
Added environment-driven allowlists for CodeRabbit and other bots while keeping defaults aligned with current GitHub app usernames.

### Outcome
Bot detection is now explicit, configurable, and easier to keep accurate over time.

### Learnings
- Treat bot usernames as configuration and document expected defaults.

## 2026-01-10 - Review Comment Coverage and Attempt Tracking

### Context
CodeRabbit can emit inline review comments without a submitted review event, and repeated CI/review triggers needed clearer loop protection signals.

### Solution
Handled `pull_request_review_comment` events for CodeRabbit feedback and introduced incremental `jules-attempt-*` labels to track retries explicitly.

### Outcome
Supervisor now captures comment-only feedback and can halt after a configurable number of retry attempts.

### Learnings
- Track retries via labels to avoid brittle commit-count heuristics.

## 2026-01-10 - Codecov Bot Allowlist

### Context
Review handling should rely on explicit Codecov bot identities rather than substring checks to avoid false positives.

### Solution
Added a dedicated `CODECOV_USERS` allowlist and included Codecov in the supervisor bot identity configuration.

### Outcome
Codecov review activity is now matched deterministically alongside CodeRabbit.

### Learnings
- Keep each bot identity list explicit to reduce accidental matches and drift.
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

## 2026-01-19 - Consolidated Jules feedback comments

### Context

The supervisor workflow posted multiple comments per feedback event, which created noise and hid the actionable details.

### Solution

Merged the Jules mention status and feedback into a single comment so routing context and feedback arrive together.

### Outcome

Feedback now lands in one clear comment without extra status spam.

### Learnings

- Batch routing context and actionable feedback into a single comment to reduce notification fatigue.

## 2026-01-23 - TaskCard Button Standardization

### Context

The `TaskCard` component used a raw HTML `<button>` for the "Fix" action, creating visual inconsistency (incorrect border radius of 4px instead of 16px) and bypassing the design system's interactive states.

### Solution

Replaced the raw button with the shared `Button` component:
- Used `variant="ghost"` and `size="sm"`.
- Applied custom utility classes (`h-6 px-2 text-[10px]`) to maintain the necessary information density and compactness required by the "Power Toolbar" pattern in the Builder interface.
- Verified that `Button` correctly merges `className` props, allowing for these granular overrides while preserving the base `rounded-lg` token.

### Outcome

- Standardized interaction model (hover, focus rings).
- Consistent `rounded-lg` geometry across the Builder UI.
- Improved maintainability by removing ad-hoc styles.

### Learnings

- Standard components like `Button` should be flexible enough to handle "micro" use cases without needing a new component, as long as the base geometry (`rounded-lg`) is respected.

## 2026-01-27 - Strict typing in unit tests

### Context

Code review flagged that unit tests for `ProjectGrid` were using `any` for mocked component props, violating the project's strict TypeScript mandate.

### Solution

Refactored the mocks to use explicit types like `React.ComponentProps` and `React.HTMLAttributes`, ensuring that even mocked components adhere to type safety without relying on `any`.

### Outcome

The codebase remains compliant with strict TypeScript standards, including test files, preventing type regression and maintaining high code quality.

### Learnings

- Tests are first-class citizens and must adhere to the same strict type safety rules as source code; avoid `any` in mocks by using `React.ComponentProps<typeof Component>`.

## 2026-01-27 - Jules API v1alpha Integration

### Context

The agent supervisor pipeline relied on an external GitHub Action and limited CLI tools, which prevented leveraging the latest Jules capabilities like repoless sessions and fine-grained source context control. Codecov integration was also rudimentary, missing actionable details.

### Solution

Refactored the supervisor into modular TypeScript scripts using `octokit` for reliability and implemented a direct client for the Jules v1alpha REST API. Enhanced Codecov processing to parse coverage drops from comments and generate targeted prompts.

### Outcome

The pipeline now interacts directly with the latest Jules API, enabling full control over session creation and prompt context. Codecov alerts are smarter, providing specific file contexts for fixes.

### Learnings

- Direct API integration often provides better control and velocity than third-party wrappers when APIs are rapidly evolving (v1alpha).
- Modularizing monolithic CI scripts (`supervisor.ts` -> `supervisor/`) improves testability and maintenance.
