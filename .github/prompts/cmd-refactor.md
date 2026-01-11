$PROJECT_CONTEXT

## TASK
You have been invoked via the `/refactor` command.

## REQUEST
$COMMENT_BODY

## INSTRUCTIONS
1.  **Analyze**: Review the code specified in the request or the current context.
2.  **Refactor**: Apply standard software engineering principles:
    *   **Clean Code**: Improve naming, modularity, and readability.
    *   **DRY**: Remove duplication.
    *   **Performance**: Optimize loops or expensive operations.
    *   **Type Safety**: Ensure strict TypeScript compliance.
3.  **Verify**:
    *   Run `pnpm type-check`.
    *   Run `pnpm test:unit` to ensure no regressions.