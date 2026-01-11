You have been invoked via the `/test` command.

## Request
$COMMENT_BODY

## Instructions
1.  **Identify**: Determine which components or functions lack sufficient testing based on the request.
2.  **Implement**:
    *   Create or update unit tests in `tests/unit/`.
    *   Use **Vitest** syntax (standard for this project).
    *   Cover happy paths, edge cases, and error states.
3.  **Verify**:
    *   Run `pnpm test:unit` and ensure the new tests pass.
