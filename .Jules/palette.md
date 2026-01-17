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
