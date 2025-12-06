# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Release cadence

We aim to publish stable releases on a **monthly cadence**, with interim patch releases as needed for security or high-priority fixes. If a month passes without user-visible changes, we will still close out the cycle by tagging a maintenance release (for example, incrementing the patch version) to capture dependency or tooling updates.

## Release process

1. Ensure the `main` branch is green (lint, tests, and database migrations where applicable).
2. Update the `## [Unreleased]` section below with any user-visible changes since the last release, grouping entries under `Added`, `Changed`, `Fixed`, and `Removed` as needed. Remove empty headings before publishing.
3. Bump the version in `package.json` to the new release number, commit the change, and update the headings in this file to include the new version and date. Follow the Keep a Changelog structure by adding the new version section **above** `## [Unreleased]` and moving the previous `Unreleased` entries into it.
4. Tag the release with an annotated tag (`git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`).
5. Draft a GitHub Release using the pushed tag, copying the relevant changelog section into the release notes. Include a compare link from the previous tag (for example, `https://github.com/<org>/<repo>/compare/vA.B.C...vX.Y.Z`).
6. Verify the deployment (preview and production, if applicable) and annotate any post-release follow-ups in the GitHub Release notes.

> Automated changelog generation is **not** currently configured for this repository. If added in the future (for example, via Changesets or Release Drafter), link the workflow or script here and follow its output when drafting releases.

## Writing changelog entries

- Use past tense for completed work and imperative voice for guidance (for example, "Documented release cadence" vs. "Document release cadence").
- Keep entries user-focused and succinct; prefer bullet points to paragraphs.
- Example template when cutting a release:

```
## [Unreleased]

## [X.Y.Z] - YYYY-MM-DD
### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...
```

## [Unreleased]

### Added
- Documented design system tokens, states, and shadcn/ui usage patterns.
- Initial changelog scaffold and release process documentation.
- Documented testing expectations for unit, integration, and accessibility coverage.
- Added architecture overview covering chat pipeline, persistence, auth, blob storage, and AI SDK wiring.
- Documented data handling practices for secrets, PII, generated content, rate limiting, logging, and prompt safety.
- Clarified that `AGENTS.md` files are the authoritative source for contributor guidance.
- Added project entities with default world-building folders, list/detail pages, and role-aware creation flows wired to Auth.js.
- Documented migration maintenance steps and CI/CD verification expectations.
- Added a pre-commit hook that runs linting and type checks before allowing commits.

### Fixed
- Resolved the project creation page failing build-time client checks by isolating client hooks into a dedicated component.
- Fixed schema management errors by aligning validation error codes with the shared error map and surfacing descriptive messages.
- Corrected quick-start project selection notifications to align with the toast API and avoid build-time type errors.
- Normalized serialized project descriptions to avoid undefined/null type mismatches during builds.
- Prevented project selection URL syncing from reloading the chat page when the project was already chosen.
- Guarded project ID URL updates to satisfy type safety and avoid redundant search param rewrites.

