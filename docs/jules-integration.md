# Jules Integration Guide

The AI Book World Builder integrates with the **Google Jules API** to provide an autonomous software engineering agent that can manage the project's development lifecycle.

## Overview

Jules is an AI agent capable of:
1.  **Planning**: Analyzing issues and creating step-by-step implementation plans.
2.  **Coding**: Generating code changes (Git patches) and verifying them.
3.  **Reviewing**: Analyzing PRs and fixing feedback automatically.

## Architecture

The integration is built on three pillars:

### 1. Jules Client (`src/lib/jules-client.ts`)
A strongly-typed wrapper around the Google Jules API (`https://jules.googleapis.com/v1alpha`).
-   **Authentication**: Uses `JULES_API_KEY`.
-   **Resources**: Manages `Sessions`, `Sources` (GitHub Repos), and `Activities`.

### 2. Server Actions (`src/app/actions/jules.ts`)
Server-side operations that securely invoke the client.
-   `createSessionAction`: Starts a new task (e.g., "Fix bug X").
-   `approvePlanAction`: Authorizes Jules to execute a plan.
-   `sendMessageAction`: Sends user feedback to the agent.

### 3. Admin UI (`src/app/admin/github`)
A dashboard for admins to oversee Jules' activities.
-   **Task Board**: Kanban-style view of active sessions.
-   **Chat Interface**: Direct communication with the agent.
-   **Artifact Renderer**: Visualizes generated plans, diffs, and bash outputs.

## Key Concepts

### Sessions
A **Session** represents a single unit of work (like a Ticket or Issue).
-   **States**: `PLANNING`, `AWAITING_PLAN_APPROVAL`, `IN_PROGRESS`, `COMPLETED`.
-   **Isolation**: Each session operates on a specific `Source` (GitHub Repo).

### Plans
Before executing code, Jules generates a **Plan**.
-   **Review**: Admins must approve the plan (via `approvePlan`) before execution proceeds.
-   **Steps**: The plan consists of granular steps (e.g., "Create file X", "Run tests").

### Activities
The immutable history of events within a session.
-   **Types**: `planGenerated`, `userMessaged`, `agentMessaged`, `sessionCompleted`.
-   **Artifacts**: Activities may contain artifacts like `gitPatch` (diffs) or `bashOutput`.

## Configuration

To enable Jules, set the following environment variables:

```bash
JULES_API_KEY=your_api_key_here
```

## Developer Workflow

### interacting with the API

```typescript
import { JulesClient } from "@/lib/jules-client";

const client = new JulesClient();

// Start a new session
const session = await client.createSession({
  prompt: "Fix the navigation bug",
  sourceName: "projects/my-project/locations/global/sources/github-repo",
});

// Approve the plan once generated
await client.approvePlan(session.name);
```

### Adding New Capabilities
To extend Jules' capabilities, modify the `JulesClient` to support new API methods or update the `ArtifactRenderer` (`src/components/admin/jules/artifact-renderer.tsx`) to visualize new output types.
