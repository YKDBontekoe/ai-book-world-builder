# Agentic Workflow Documentation

This document describes the fully automated, AI-driven CI/CD and development workflow for AI Book World Builder. The system minimizes human intervention while maintaining code quality and security.

## Overview

The agentic workflow automates the entire development lifecycle with **cost-optimized Jules invocations**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHOR-BASED INVOCATION STRATEGY                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PR Author = Jules?     →  @jules mention (FREE via GitHub integration)    │
│  PR Author = Renovate?  →  API once, then @jules mentions                  │
│  PR Author = Human?     →  API invoke (full context needed)                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. AI Agents

| Agent | Role | Cost Strategy |
|-------|------|---------------|
| **Jules** (Google) | Implements features, fixes issues | API for new context, @mentions for existing |
| **CodeRabbit** | AI code review | Free (GitHub App) |
| **Renovate** | Dependency updates | N/A |

### 2. Workflow Files

| Workflow | Purpose |
|----------|---------|
| `agentic-supervisor.yml` | Central orchestrator with author-based invocation |
| `pr-jules-ci-fix.yml` | CI failure fixes with same author-based logic |
| `pr-auto-merge.yml` | Auto-merge rules |
| `security-audit.yml` | Nightly security scan |
| `stale-branch-cleanup.yml` | Weekly cleanup of abandoned Jules branches |
| `ci.yml` | CI checks |

---

## Author-Based Invocation Strategy

### Jules PRs (`google-labs-jules`)
- **NEVER** uses Jules API (prevents recursive sessions)
- Always uses `@jules` comment mentions
- GitHub integration handles the mention natively
- **Cost: $0**

### Renovate PRs (`renovate[bot]`)
- First failure/review: Uses Jules API + adds `jules-invoked` label
- Subsequent issues: Uses `@jules` mentions
- **Cost: 1 API call per PR maximum**

### Human PRs
- Always uses Jules API (needs full codebase context)
- Standard cost per invocation

---

## Detection: CodeRabbit Review Complete

The supervisor detects a complete CodeRabbit review by:
1. Listening for `pull_request_review` events from `coderabbitai[bot]`
2. Checking if the review body contains "Walkthrough"
3. Batching ALL inline comments into a single prompt

```bash
# From agentic-supervisor.sh
if [[ "$EVENT_NAME" == "pull_request_review" && 
      "$REVIEW_AUTHOR" == "coderabbitai[bot]" ]]; then
  if echo "$REVIEW_BODY" | grep -qi "walkthrough"; then
    BATCHED_COMMENTS=$(collect_coderabbit_comments)
    # ... batch and invoke
  fi
fi
```

---

## Tracking: `jules-invoked` Label

The `jules-invoked` label tracks whether Jules API has been invoked for a PR:

- **Added when:** First Jules API invocation on a Renovate PR
- **Checked before:** Any subsequent invocation decision
- **Effect:** Switches from API to @mention for cost savings

---

## Architecture

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
   │                                                                     │
   │   1. Context Resolution (PR vs Issue, Author)                       │
   │   2. Invocation Method Selection (API vs Mention)                   │
   │   3. Comments Batching                                              │
   └──────────────────────────────┬──────────────────────────────────────┘
                                  │
               ┌──────────────────┼──────────────────┐
               ▼                  ▼                  ▼
       ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
       │ jules-api-    │  │ jules-mention │  │  coderabbit-  │
       │ invoke        │  │               │  │  trigger      │
       │ (Human, first │  │ (@jules       │  │               │
       │  Renovate)    │  │  comment)     │  │               │
       └───────────────┘  └───────────────┘  └───────────────┘
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.coderabbit.yaml` | CodeRabbit review settings (updated to always @jules for bots) |
| `renovate.json` | Dependency update settings |
| `AGENTS.md` | Instructions for AI agents |

---

### 3. Prompt Management

Prompts are externalized in `.github/prompts/` for easier maintenance:
- `manual-issue.md` & `manual-pr.md`: Human triggers
- `renovate-review.md`: Enhanced instructions for dependency updates
- `ci-failure.md`: Context for CI fixes
- `code-rabbit-review.md`: Code review feedback

### 4. Observability

The `agentic-supervisor` workflow outputs a rich **GitHub Job Summary** table, showing:
- Context (PR/Issue) and Author
- Selected Invocation Method
- Number of batched comments
- Decision reasoning

---

## Maintenance

### Stale Branch Cleanup
- **Schedule:** Sundays at 01:00 UTC
- **Action:** Deletes `jules/*` and `agent/*` branches older than 7 days **if** they have no open PRs.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-01-01 | Added Stale Branch Cleanup, Job Summaries, External Prompts |
| 2.0.0 | 2026-01-01 | Author-based invocation strategy, cost optimization |
| 1.1.0 | 2025-05-20 | Unified Agentic Supervisor |
| 1.0.0 | 2024-12-27 | Initial agentic workflow |
