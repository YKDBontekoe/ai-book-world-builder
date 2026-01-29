# Agentic Workflow Documentation

Simplified AI-driven CI/CD workflow for AI Book World Builder.

## Flow Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                     AUTHOR-BASED ROUTING                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PR Opens → CI Runs                                               │
│       │                                                           │
│       ├── Fail? ─┬── Jules PR → @jules mention (free)            │
│       │          └── Bot/Human PR → Jules API                     │
│       │                                                           │
│       └── Pass? → Trigger CodeRabbit                              │
│                          │                                        │
│                          └── Parse "Fix all issues"               │
│                                     │                             │
│                          ┌──────────┴──────────┐                  │
│                          │                     │                  │
│                     Jules PR            Bot/Human PR              │
│                          │                     │                  │
│                   @jules mention         Jules API                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Author Types

| Author | Detection | Invocation Method |
|--------|-----------|-------------------|
| `google-labs-jules` | Contains "jules" | `@jules` mention (free) |
| `renovate[bot]` | Ends with `[bot]` | Jules API (full context) |
| `dependabot[bot]` | Ends with `[bot]` | Jules API (full context) |
| Human users | No bot suffix | Jules API (full context) |

## Workflow Triggers

| Event | Action |
|-------|--------|
| CI fails | Notify Jules (@mention or API based on author) |
| CI passes | Trigger `@coderabbitai review` |
| CodeRabbit submits review | Parse "Fix all issues" → forward to Jules |

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/agentic-supervisor.yml` | Main workflow |
| `.github/scripts/supervisor/` | Decision logic modules |
| `.github/scripts/invoke-jules.ts` | Jules API Client |
