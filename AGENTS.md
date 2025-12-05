# Agent and Contributor Guidelines

## Scope
This guidance applies to the entire repository. Add more specific rules in nested `AGENTS.md` files when necessary.

## Coding Standards
- **TypeScript/React**: Prefer function components with hooks, uphold strict typing (no `any` unless unavoidable and documented), and keep components small and composable. Follow existing linting/formatting rules (see `biome.jsonc`).
- **State Management**: Lift state to the lowest sensible owner and pass explicit props; avoid implicit globals.
- **shadcn/ui**: Use the generated shadcn components for shared primitives instead of custom one-off versions. Extend components through props, slots, or composition rather than editing generated files directly unless fixing defects. Keep styling token-driven and avoid inline `style` when `className`/variants suffice.
- **Accessibility**: Ensure interactive elements are keyboard accessible, labeled, and meet ARIA expectations.
- **Design Resources**: Link to design tokens and the component library once they are defined so contributors can align implementations consistently.

## Testing Expectations
- Prefer fast, deterministic tests. Add or update coverage alongside code changes.
- Run relevant unit, integration, and end-to-end suites before merging. Document any skipped or flaky tests and justify temporarily disabled cases.

## Changelog Policy
- Record user-visible changes in the project changelog (or nearest equivalent) as part of each feature or fix. Use clear, action-oriented entries that describe the behavior change.

## Pull Request Message Format
Every PR description should include:
1. **Summary**: Bulleted highlights of the change.
2. **Testing**: Commands executed and their outcomes.
3. **Additional Notes**: Call out migrations, breaking changes, follow-ups, or links to design tokens/component library when available.
