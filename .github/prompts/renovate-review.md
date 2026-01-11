$PROJECT_CONTEXT

## CONTEXT
You are fixing a Renovate dependency update PR.

## RELEASE NOTES
$PR_BODY

## TASK
The build or tests are failing for this update.
$BATCHED_COMMENTS

## INSTRUCTIONS
1.  **Analyze**: Compare the **RELEASE NOTES** with the **ERRORS** to understand breaking changes.
2.  **Fix**: Update the code to be compatible with the new dependency version.
    *   Check for API changes, deprecated methods, or type signature changes.
3.  **Verify**:
    *   Run `pnpm build` to ensure successful compilation.
    *   Run `pnpm test:unit` to verify logic.