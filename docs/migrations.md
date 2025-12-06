# Database migration maintenance

This repository uses Drizzle migrations stored in `lib/db/migrations`. Follow these steps to create, apply, and verify migrations locally and in CI/CD.

## Creating a migration
- Update the schema in `lib/db/schema.ts` and run `pnpm db:generate` to produce a new SQL migration under `lib/db/migrations`.
- Review the generated SQL for safety (idempotence where appropriate) and check the snapshot in `lib/db/migrations/meta` into version control.
- Add any manual backfill scripts separately if data migrations are required.

## Applying migrations locally
- Use `pnpm db:migrate` to run `lib/db/migrate.ts` against your local database. This is the same entry point invoked during builds.
- Confirm the migration succeeds and leaves the schema in the expected state before opening a PR.

## CI/CD verification
- The Vercel build executes `tsx lib/db/migrate` via the `build` script, so migrations run during deploys. Confirm the deployment log includes the migration step and completion status. Example from the latest pipeline:
  - `⏳ Running migrations...`
  - Postgres notices about existing schema/migration tables (expected on reruns)
  - `✅ Migrations completed in 1654 ms`
- If a migration fails in CI, fix the schema or generated SQL and regenerate the migration before retrying.
