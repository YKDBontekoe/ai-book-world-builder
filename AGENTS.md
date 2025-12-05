# Agent and Contributor Guidelines

## Scope
This guidance applies to the entire repository. Add more specific rules in nested `AGENTS.md` files when necessary.

`AGENTS.md` files are the authoritative source for contributor instructions. Consult them first; the `README.md` may not capture the most current guidance.

## Coding Standards
- **TypeScript/React**: Prefer function components with hooks, uphold strict typing (no `any` unless unavoidable and documented), and keep components small and composable. Follow existing linting/formatting rules (see `biome.jsonc`).
- **State Management**: Lift state to the lowest sensible owner and pass explicit props; avoid implicit globals.
- **shadcn/ui**: Use the generated shadcn components for shared primitives instead of custom one-off versions. Extend components through props, slots, or composition rather than editing generated files directly unless fixing defects. Keep styling token-driven and avoid inline `style` when `className`/variants suffice.
- **Accessibility**: Ensure interactive elements are keyboard accessible, labeled, and meet ARIA expectations.
- **Design Resources**: Link to design tokens and the component library once they are defined so contributors can align implementations consistently.
- **Design system adherence**: Always align UI changes with the shared design system (see `docs/design-system.md`). Reference tokens, variants, and interaction patterns before introducing new UI affordances.

## Testing Expectations
- Prefer fast, deterministic tests. Add or update coverage alongside code changes.
- Run relevant unit, integration, and end-to-end suites before merging. Document any skipped or flaky tests and justify temporarily disabled cases.
- Every new feature must include appropriate tests (unit, integration, accessibility) and the suites must be green before merge. Avoid merging with known test failures except for documented, time-bound exceptions.

## Process and Documentation Hygiene
- When you add repository conventions, testing expectations, or design guidance, update the relevant `AGENTS.md` sections so future contributors can find the rules in one place.

## Changelog Policy
- Record user-visible changes in the project changelog (or nearest equivalent) as part of each feature or fix. Use clear, action-oriented entries that describe the behavior change.
- Keep changelog headings aligned with the Keep a Changelog format and remove empty sections before publishing releases. See `CHANGELOG.md` for the expected structure and release cadence.
- When adding release documentation, ensure the process describes tagging, GitHub Releases, and any automation (or the lack thereof).

## Design system reference
- Align UI work with the shared tokens and component patterns documented in `docs/design-system.md` (typography, spacing, color tokens, states, and shadcn/ui examples). Link to the guide when adding new UI patterns or extending components.

## Pull Request Message Format
Every PR description should include:
1. **Summary**: Bulleted highlights of the change.
2. **Testing**: Commands executed and their outcomes.
3. **Additional Notes**: Call out migrations, breaking changes, follow-ups, or links to design tokens/component library when available.
