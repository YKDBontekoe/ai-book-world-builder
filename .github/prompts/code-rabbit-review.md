$PROJECT_CONTEXT

## TASK
Review and address feedback from CodeRabbit AI.

## FEEDBACK
$BATCHED_COMMENTS

## INSTRUCTIONS
1.  **Analyze**: Review each piece of feedback above.
2.  **Implement**: Fix the code issues identified.
    *   If a "Committable suggestion" is provided, verify it is correct before applying.
    *   If feedback is stylistic, follow the project's **CODING CONVENTIONS**.
3.  **Verify**:
    *   Run `pnpm type-check` and `pnpm test:unit`.
    *   Ensure all tests pass.
4.  **Commit**: Use a clear commit message like `fix: address coderabbit feedback`.