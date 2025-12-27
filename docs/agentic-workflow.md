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
| `agentic-pr.yml` | Main PR lifecycle automation | `.github/workflows/` |
| `jules-review-comments.yml` | Jules handles CodeRabbit feedback | `.github/workflows/` |
| `jules-issues.yml` | Jules works on issues | `.github/workflows/` |
| `security-audit.yml` | Nightly security scan + auto-fix | `.github/workflows/` |
| `ci.yml` | CI checks + Jules fixes failures | `.github/workflows/` |
| `coderabbit-trigger.yml` | Triggers CodeRabbit reviews | `.github/workflows/` |

### 3. Configuration Files

| File | Purpose |
|------|---------|
| `.coderabbit.yaml` | CodeRabbit review settings |
| `renovate.json` | Renovate dependency update settings |
| `AGENTS.md` | Instructions for AI agents |

---

## Issue-to-PR Automation

### Triggering Jules on Issues

There are two ways to have Jules work on an issue:

#### 1. Add the `jules` Label

```
1. Create or open an issue
2. Add the label "jules"
3. Jules acknowledges and starts working
4. Jules creates a PR with the solution
```

#### 2. Mention @jules in a Comment

```markdown
@jules please implement this feature

@jules can you fix this bug?

@jules investigate why this is failing
```

### Auto-Triage

New issues are automatically analyzed and labeled:

| Detection | Labels Applied |
|-----------|----------------|
| Bug keywords (error, crash, broken) | `bug` |
| Feature keywords (add, new, request) | `enhancement` |
| Documentation mentions | `documentation` |
| Questions (how to, ?) | `question` |
| Urgent/security keywords | `priority/high` |

---

## Pull Request Automation

### Lifecycle Stages

```
┌──────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: PR OPENED                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PR Created ──▶ Auto-Label ──▶ Route by Type                             │
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
├──────────────────────���───────────────────────────────────────────────────┤
│                                                                           │
│  CI Triggered ──▶ Lint + Type Check ──▶ Unit Tests ──▶ Build            │
│                                                              │            │
│                                              ┌───────────────┴──────┐    │
│                                              ▼                      ▼    │
│                                           Pass                   Fail   │
│                                              │                      │    │
│                                              ▼                      ▼    │
│                                    Is Draft PR?             Jules Fixes │
│                                         │                            │    │
│                              ┌──────────┴──────────┐                 ▼    │
│                              ▼                     ▼          Re-run CI   │
│                        Yes (Jules)              No                       │
│                              │                     │                      │
│                              ▼                     ▼                      │
│                    Mark Ready for Review    Ready for Merge              │
│                              │                                            │
│                              ▼                                            │
│                    Triggers ready_for_review                             │
│                              │                                            │
│                              ▼                                            │
│                    Ready for Merge                                       │
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

### Jules Draft PR Handling

Jules always creates PRs in **draft mode**. The CI pipeline handles this automatically:

1. **CI runs on draft PRs** - The CI workflow triggers on `opened`, `synchronize`, `reopened`, and `ready_for_review` events
2. **Auto-promotion on success** - When CI passes on a Jules draft PR, it's automatically marked as "ready for review"
3. **Re-triggers workflows** - The `ready_for_review` event triggers additional workflows like CodeRabbit review

```
Jules Creates Draft PR ──▶ CI Runs ──▶ Pass? ──▶ Mark Ready for Review
                                         │
                                         ▼
                                       Fail
                                         │
                                         ▼
                                   Jules Fixes
                                         │
                                         ▼
                                   Re-run CI
```

This ensures:
- Jules PRs are validated before being visible for review
- Failed PRs stay in draft until fixed
- Human reviewers only see PRs that pass CI

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

---

## Security Automation

### Nightly Security Audit

The `security-audit.yml` workflow runs every night:

```
Midnight UTC ──▶ pnpm audit ──▶ Vulnerabilities Found?
                                        │
                     ┌──────────────────┴──────────────────┐
                     ▼                                     ▼
                   Yes                                    No
                     │                                     │
                     ▼                                     ▼
            Try Auto-Fix (pnpm audit --fix)              Done ✅
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
        Success              Failed
           │                   │
           ▼                   ▼
    Create PR with         Jules Investigates
    Fixes (auto-merge)           │
                                 ▼
                          Complex Fix PR
                                 │
                                 ▼
                          Create Issue for
                          Tracking
```

### Vulnerability Labels

| Severity | Labels Applied |
|----------|----------------|
| Critical | `security`, `priority/high`, `auto-merge-candidate` |
| High | `security`, `priority/high` |
| Moderate | `security` |

---

## Required Secrets

The following secrets must be configured in GitHub repository settings:

| Secret | Purpose | How to Get |
|--------|---------|------------|
| `JULES_API_KEY` | Jules API access | [jules.google.com](https://jules.google.com) → Settings → API Key |
| `CUSTOM_PAT` | GitHub operations | GitHub → Settings → Developer Settings → Personal Access Tokens |

### CUSTOM_PAT Permissions

The Personal Access Token needs these permissions:

- `repo` - Full repository access
- `workflow` - Update workflow files
- `write:packages` - Publish packages (if needed)

---

## Manual Intervention Points

While the workflow is highly automated, some situations require human input:

### 1. Large PRs (> 200 lines)

Large changes are flagged for human review:
```
📢 Human Review Required
This PR has been labeled as `size/large` and requires human review.
```

### 2. Major Version Updates

Renovate does not auto-merge major version updates due to breaking change risk.

### 3. Conflicting Suggestions

If CodeRabbit suggestions conflict with each other, Jules uses best judgment but may require clarification.

### 4. Complex Security Issues

Some vulnerabilities cannot be auto-fixed and require architectural decisions.

---

## Monitoring the Workflow

### GitHub Actions Dashboard

View all workflow runs: `https://github.com/<owner>/<repo>/actions`

Key workflows to monitor:
- **CI** - Shows test/build status
- **Agentic PR Automation** - Shows automation activity
- **Security Audit** - Shows nightly scan results

### PR Comments

The automation posts status updates as PR comments:
- 🤖 Jules acknowledgments
- 🚨 CI failure notifications
- ✅ Auto-merge notifications
- 🔒 Security fix notifications

---

## Troubleshooting

### Jules Not Responding

1. Check if `JULES_API_KEY` is configured
2. Verify the workflow triggered (check Actions tab)
3. Check Jules API status at [jules.google.com](https://jules.google.com)

### CodeRabbit Not Reviewing

1. Verify `.coderabbit.yaml` syntax
2. Check if the PR matches `auto_review` criteria
3. Trigger manually: comment `@coderabbitai review`

### Auto-Merge Not Working

1. Verify PR has `auto-merge-candidate` label
2. Check all required status checks pass
3. Verify branch protection rules allow auto-merge

### CI Keeps Failing

1. Check if Jules is making the right fixes
2. Review the error messages in CI logs
3. Intervene manually if stuck in a loop

---

## Best Practices

### For Humans

1. **Use labels** - Apply `jules` label for AI assistance
2. **Be specific** - Clear issue descriptions help Jules
3. **Review AI work** - Always review Jules's PRs before merge
4. **Monitor security** - Check the nightly audit results

### For AI Integration

1. **Clear prompts** - Issues and comments should be unambiguous
2. **Structured feedback** - CodeRabbit comments include file/line info
3. **Incremental changes** - Small PRs are easier to auto-merge
4. **Test coverage** - Tests help verify AI-generated code

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
   ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
   │ jules-issues  │          │  agentic-pr   │          │security-audit │
   │    .yml       │          │     .yml      │          │    .yml       │
   └───────┬───────┘          └───────┬───────┘          └───────┬───────┘
           │                           │                           │
           │         ┌─────────────────┼─────────────────┐         │
           │         │                 │                 │         │
           ▼         ▼                 ▼                 ▼         ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                                                                      │
   │                          EXTERNAL SERVICES                           │
   │                                                                      │
   │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
   │  │              │    │              │    │              │           │
   │  │    Jules     │    │  CodeRabbit  │    │   Renovate   │           │
   │  │   (Google)   │    │     (AI)     │    │    (Bot)     │           │
   │  │              │    │              │    │              │           │
   │  └──────────────┘    └──────────────┘    └──────────────┘           │
   │                                                                      │
   └─────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   Automated     │
                              │   PR Updates    │
                              │   & Merges      │
                              └─────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-27 | Initial agentic workflow implementation |

---

## Related Documentation

- [Developer Guide](./developer-guide.md) - Codebase structure and patterns
- [Testing](./testing.md) - Test strategy and execution
- [AGENTS.md](../AGENTS.md) - AI agent instructions
