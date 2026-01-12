$PROJECT_CONTEXT

## TASK
Fix CI failures for PR #$PR_NUMBER.

## FAILURE DETAILS
$FAILED_JOBS

## INSTRUCTIONS
1. **Reproduce locally**:
   - Run `pnpm lint` to check linting issues
   - Run `pnpm type-check` to check TypeScript errors
   - Run `pnpm test:unit` to run unit tests
   - Run `pnpm build` to check build errors

2. **Fix all issues found**:
   - Address each failure identified above
   - Make minimal, focused changes
   - Ensure you don't break existing functionality

3. **Verify**:
   - Run all commands again to confirm fixes
   - Ensure all tests pass

4. **Commit**: Use message: `fix: resolve CI failures`
