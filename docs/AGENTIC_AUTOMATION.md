# 🤖 Agentic Automation System

Fully dynamic, label-driven PR automation powered by CodeRabbit and Jules.

## Architecture

```
                    CodeRabbit
                        │
                        ▼
              ┌─────────────────┐
              │  Auto-Labels PR │
              │  Reviews Code   │
              └────────┬────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
   ┌───────────────┐      ┌───────────────┐
   │ agentic-      │      │ CI Workflow   │
   │ orchestrator  │      │               │
   └───────┬───────┘      └───────┬───────┘
           │                      │
    ┌──────┴──────┐        ┌──────┴──────┐
    ▼             ▼        ▼             ▼
┌───────┐    ┌───────┐  ┌───────┐   ┌───────┐
│Review │    │Mention│  │CI-Fix │   │Auto   │
│Handler│    │Handler│  │Jules  │   │Merge  │
└───────┘    └───────┘  └───────┘   └───────┘
```

## Workflows

| File | Purpose |
|------|---------|
| `agentic-orchestrator.yml` | Main hub - routes events based on labels |
| `pr-jules-ci-fix.yml` | Jules fixes CI failures |
| `pr-auto-merge.yml` | Auto-merge when labels and checks allow |
| `ci.yml` | CI pipeline (lint, test, build) |
| `jules-issues.yml` | Jules handles issues |
| `deploy-*.yml` | Deployment workflows |
| `e2e-nightly.yml` | Nightly E2E tests |
| `security-audit.yml` | Security scanning |

## Label-Driven Automation

CodeRabbit auto-applies labels that drive ALL automation:

### Type Labels
| Label | Trigger |
|-------|---------|
| `auto-merge-candidate` | Enable auto-merge |
| `security` | Block auto-merge, request human review |
| `breaking-change` | Block auto-merge, request human review |
| `needs-review` | Block auto-merge, request human review |
| `skip-ci` | Skip CI auto-fix |
| `ci-failing` | Applied when CI fails, removed on pass |

### Size Labels
| Label | Lines | Effect |
|-------|-------|--------|
| `size/xs` | <10 | Auto-merge friendly |
| `size/s` | 10-50 | Auto-merge friendly |
| `size/m` | 50-200 | Normal flow |
| `size/l` | 200-500 | Normal flow |
| `size/xl` | >500 | Request human review |

### Scope Labels
| Label | When Applied |
|-------|--------------|
| `frontend` | Components, pages, styling |
| `backend` | API, actions, database |
| `ci` | Workflow changes |
| `deps` | Dependency updates |

## Event Flows

### PR Opened
```
1. CodeRabbit auto-labels (type, size, scope)
2. CodeRabbit reviews code
3. CI runs
4. If security/breaking/xl → Human review requested
5. If auto-merge-candidate + CI passes → Auto-merge
```

### CI Fails
```
1. pr-jules-ci-fix triggers
2. Adds ci-failing label
3. Jules analyzes and fixes
4. Pushes fix
5. CI re-runs
6. If passes → ci-failing removed → Check auto-merge
```

### Human Requests Changes
```
1. agentic-orchestrator triggers
2. Jules collects all feedback
3. Jules implements changes
4. Pushes fix
5. CI re-runs
```

### CodeRabbit Posts Summary
```
1. agentic-orchestrator triggers
2. Jules collects inline comments
3. Jules addresses by priority (security > bugs > perf)
4. Pushes fixes
5. CI re-runs
```

### @jules Mentioned
```
1. agentic-orchestrator triggers
2. Jules reads request
3. Jules executes (code changes, answers, etc)
4. Posts response or pushes commits
```

## Auto-Merge Rules

PR auto-merges when ALL true:
- ✅ Has `auto-merge-candidate` label
- ✅ NOT draft
- ✅ NOT has `ci-failing` label
- ✅ NOT has `security` label
- ✅ NOT has `breaking-change` label
- ✅ NOT has `needs-review` label
- ✅ All checks passed
- ✅ Mergeable (no conflicts)

## Configuration

| File | Purpose |
|------|---------|
| `.coderabbit.yaml` | CodeRabbit auto-labeling rules |
| `renovate.json` | Dependency update config |

## Secrets Required

| Secret | Used By |
|--------|---------|
| `CUSTOM_PAT` | All workflows (GitHub API) |
| `JULES_API_KEY` | Jules invocation |
