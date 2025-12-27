# Agentic Workflow Documentation

This document describes the fully automated, AI-driven CI/CD and development workflow for AI Book World Builder. The system minimizes human intervention while maintaining code quality and security.

## Overview

The agentic workflow automates the entire development lifecycle:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AGENTIC DEVELOPMENT LOOP                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Issue Created ──▶ Auto-Triage ──▶ Jules Works ──▶ PR Created             │
│                                                          │                  │
│                                                          ▼                  │
│                              ┌────────────────────────────────────────┐    │
│                              │         AUTOMATED PR LIFECYCLE         │    │
│                              ├────────────────────────────────────────┤    │
│                              │                                        │    │
│                              │  CodeRabbit Reviews                    │    │
│                              │         │                              │    │
│                              │         ▼                              │    │
│                              │  Jules Fixes Feedback                  │    │
│                              │         │                              │    │
│                              │         ▼                              │    │
│                              │  CI Runs                               │    │
│                              │         │                              │    │
│                              │    Pass─┼─Fail                         │    │
│                              │         │    │                         │    │
│                              │         ▼    ▼                         │    │
│                              │  Merge   Jules Fixes                   │    │
│                              │                                        │    │
│                              └────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| **Jules** (Google) | Implements features, fixes issues, addresses reviews | Issues labeled `jules`, `@jules` mentions, CI failures |
| **CodeRabbit** | AI code review, security analysis, style checks | PR opened/updated |
| **Renovate** | Dependency updates, security patches | Scheduled (weekly) |

### 2. Workflow Files

| Workflow | Purpose | Location |
|----------|---------|----------|
| `agentic-supervisor.yml` | **Unified Orchestrator**: Handles Issues, PRs, Reviews, and Bot Triage | `.github/workflows/` |
| `pr-jules-ci-fix.yml` | Jules fixes CI failures (triggered by workflow completion) | `.github/workflows/` |
| `pr-auto-merge.yml` | Auto-merge rules | `.github/workflows/` |
| `security-audit.yml` | Nightly security scan + auto-fix | `.github/workflows/` |
| `ci.yml` | CI checks | `.github/workflows/` |

### 3. Configuration Files

| File | Purpose |
|------|---------|
| `.coderabbit.yaml` | CodeRabbit review settings |
| `renovate.json` | Renovate dependency update settings |
| `AGENTS.md` | Instructions for AI agents |

---

## Agentic Supervisor

The `agentic-supervisor.yml` is the central brain of the automation. It replaces the old split workflows (`agentic-orchestrator` and `jules-issues`) to provide consistent behavior.

### Capabilities

1.  **Context Resolution**: Automatically detects if a comment is on a PR or an Issue.
    *   **PR Comment**: Fetches the correct branch (`head.ref`) so Jules commits to the feature branch.
    *   **Issue Comment**: Defaults to `main` and instructs Jules to create a new branch.
2.  **Intent Detection**: Distinguishes between:
    *   User commands (`@jules fix this`)
    *   CodeRabbit instructions ("Prompt for AI Agents")
    *   Human Review Requests ("Changes Requested")
3.  **Auto-Triage**: Labels new issues based on keywords (bug, enhancement, question).
4.  **Onboarding**: Posts helpful instructions for "good first issue" labels.

### Triggering Jules

#### 1. On Issues

*   **Label**: Add `jules` label.
    *   *Result*: Jules creates a new branch and PR.
*   **Comment**: `@jules please fix this bug`.
    *   *Result*: Jules creates a new branch and PR.

#### 2. On Pull Requests

*   **Comment**: `@jules update this function`.
    *   *Result*: Jules pushes a commit to the **current PR branch**.
*   **CodeRabbit**: Bot asks "Prompt for AI Agents".
    *   *Result*: Jules implements changes on the **current PR branch**.
*   **Review**: Human requests changes (Review Status: `Changes Requested`).
    *   *Result*: Jules reads the review body and pushes fixes to the **current PR branch**.

---

## Pull Request Automation

### Lifecycle Stages

```
┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: PR OPENED                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PR Created ──▶ Supervisor Detects ──▶ Route by Type                     │
│                     │                                                     │
│        ┌────────────┼────────────┬────────────────────┐                  │
│        ▼            ▼            ▼                    ▼                  │
│   Dependency    Small Docs    Normal PR          Large PR               │
│   Update        Change        (< 200 lines)      (> 200 lines)          │
│        │            │            │                    │                  │
│        ▼            ▼            ▼                    ▼                  │
│   Auto-Approve  Auto-Approve  CodeRabbit         Request Human          │
│   + Auto-Merge  + Auto-Merge  Reviews            Review                 │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: CODE REVIEW                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  CodeRabbit Starts ──▶ Posts Inline Comments ──▶ Posts Summary           │
│                                                        │                  │
│                                                        ▼                  │
│                            Jules Notified (workflow triggers on summary) │
│                                                        │                  │
│                                                        ▼                  │
│                            Jules Collects ALL Feedback                   │
│                                                        │                  │
│                                                        ▼                  │
│                            Jules Implements Fixes                        │
│                                                        │                  │
│                                                        ▼                  │
│                            Pushes Commit                                 │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: CI VERIFICATION                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  CI Triggered ──▶ Lint + Type Check ──▶ Unit Tests ──▶ Build            │
│                                                              │            │
│                                              ┌───────────────┴──────┐    │
│                                              ▼                      ▼    │
│                                           Pass                   Fail   │
│                                              │                      │    │
│                                              ▼                      ▼    │
│                                    Ready for Merge          Jules Fixes │
│                                                                      │    │
│                                                                      ▼    │
│                                                              Re-run CI   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: MERGE                                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  All Checks Pass ──▶ Check Labels                                        │
│                           │                                               │
│           ┌───────────────┴───────────────┐                              │
│           ▼                               ▼                              │
│   Has 'auto-merge-candidate'       No auto-merge label                  │
│           │                               │                              │
│           ▼                               ▼                              │
│   Auto-Merge (squash)             Wait for Human Approval               │
│                                           │                              │
│                                           ▼                              │
│                                   Human Approves ──▶ Merge              │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Auto-Labeling


PRs are automatically labeled based on:

| Criteria | Labels |
|----------|--------|
| Changed files in `src/` | `source-code` |
| Changed files in `tests/` | `tests` |
| Changed files in `.github/` | `ci/cd` |
| Changed `package.json` | `dependencies` |
| Changed `.md` files | `documentation` |
| < 50 lines changed | `size/small` |
| 50-200 lines changed | `size/medium` |
| > 200 lines changed | `size/large` |
| Author is `renovate[bot]` | `dependencies`, `auto-merge-candidate` |

### Auto-Merge Criteria

PRs are auto-merged when ALL conditions are met:

1. Has label `auto-merge-candidate`
2. All CI checks pass
3. No merge conflicts
4. CodeRabbit review complete

---

## CodeRabbit Integration

### Configuration Highlights

The `.coderabbit.yaml` configuration includes:

```yaml
reviews:
  profile: "assertive"              # Thorough review style
  auto_review:
    enabled: true
    drafts: true                    # Review Jules's draft PRs
  auto_apply_labels: true           # Auto-label based on review
  enable_prompt_for_ai_agents: true # Better Jules integration
```

### Path-Specific Instructions

Different parts of the codebase get specialized review focus:

| Path | Focus |
|------|-------|
| `src/app/actions/**` | Auth checks, Zod validation, rate limiting |
| `src/app/api/**` | HTTP status codes, error responses, middleware |
| `src/components/**` | TypeScript props, accessibility, memory leaks |
| `src/db/**` | N+1 queries, indexes, SQL injection |
| `tests/**` | Coverage, edge cases, flaky patterns |
| `.github/workflows/**` | Secrets, permissions, injection |

### Review-to-Fix Flow

```
CodeRabbit Posts Comment ──▶ Contains "## Walkthrough" or "## Summary"
                                        │
                                        ▼
                              Workflow Triggers
                                        │
                                        ▼
                              Collect ALL Comments
                                (inline + general + reviews)
                                        │
                                        ▼
                              Filter Actionable Items
                                (inline code comments)
                                        │
                                        ▼
                              Jules Receives Prompt
                                        │
                                        ▼
                              Jules Implements Fixes
                                        │
                                        ▼
                              Commits + Pushes
```

---

## Dependency Management

### Renovate Configuration

The `renovate.json` enables fully automated dependency updates:

```json
{
  "automerge": true,
  "automergeType": "pr",
  "automergeStrategy": "squash",
  "platformAutomerge": true
}
```

### Package Grouping

Related packages are grouped for easier management:

| Group | Packages |
|-------|----------|
| React | `react-*`, `@types/react*` |
| Next.js | `next*`, `@next/*` |
| Testing | `vitest`, `playwright`, `@testing-library/*` |
| TypeScript | `typescript`, `@types/*` |
| Drizzle ORM | `drizzle-*` |
| Radix UI | `@radix-ui/*` |
| AI/LLM | `@google/generative-ai`, `ai`, `openai` |

### Update Schedule

| Update Type | Behavior |
|-------------|----------|
| Patch | Auto-merge immediately |
| Minor | Auto-merge after CI passes |
| Major | Requires human review |
| Security | High priority, auto-merge |
>>>>>>> origin/main

---

## Security Automation

### Safe Input Handling
The supervisor workflow uses strict **Environment Variable Mapping** to prevent script injection. All user-controlled inputs (comments, bodies, labels) are mapped to `env` variables before being used in shell scripts.

```yaml
env:
  COMMENT_BODY: ${{ github.event.comment.body }}
run: |
  # Safe usage
  if [[ "$COMMENT_BODY" == *"@jules"* ]]; then ...
```

### Nightly Security Audit
(Unchanged from previous version)

---

## Architecture Diagram

```
                              ┌─────────────────┐
                              │     GitHub      │
                              │   Repository    │
                              └────────┬────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
   ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
   │    Issues     │          │ Pull Requests │          │   Scheduled   │
   │               │          │               │          │    Scans      │
   └───────┬───────┘          └───────┬───────┘          └───────┬───────┘
           │                           │                           │
           ▼                           ▼                           ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                       AGENTIC SUPERVISOR                            │
   │                   (.github/workflows/agentic-supervisor.yml)        │
   │                                                                     │
   │   1. Context Resolution (PR vs Issue)                               │
   │   2. Intent Analysis (Chat vs Review vs Triage)                     │
   │   3. Agent Invocation (Jules Action)                                │
   └─────────────────────────────────────────────────────────────────────┘
           │                           │                           │
           ▼                           ▼                           ▼
   ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
   │ Jules Fixes   │          │ CodeRabbit    │          │  Auto-Label   │
   │ (Code Change) │          │ Review        │          │  & Triage     │
   └───────────────┘          └───────────────┘          └───────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-05-20 | Unified Agentic Supervisor, Fixed Context Resolution, Security Hardening |
| 1.0.0 | 2024-12-27 | Initial agentic workflow implementation |
