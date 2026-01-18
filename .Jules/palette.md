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

## 2026-01-18 - Prompt placeholder replacement uses literal tokens

### Context

The supervisor prompt builder returned literal placeholders like `$BATCHED_COMMENTS` because the regex treated `$` as an end-of-line anchor.

### Solution

Switched to string-based `replaceAll` so placeholder tokens are replaced literally without regex escaping pitfalls.

### Outcome

Jules API prompts now receive the actual batched feedback instead of the raw placeholder token.

### Learnings

- Prefer string replacement APIs for tokenized prompt templates to avoid regex metacharacter issues.
