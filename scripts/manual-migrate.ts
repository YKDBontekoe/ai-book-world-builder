import { db } from "../lib/db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Migrating...");

  // Update User
  await db.execute(sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" text`);
  await db.execute(sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" text`);
  await db.execute(sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" timestamp`);

  // Add unique constraint safely
  try {
      await db.execute(sql`ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE ("email")`);
  } catch (e: any) {
      console.log("Unique constraint might already exist or failed:", e.message);
  }

  // Create Account
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "Account" (
        "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "type" text NOT NULL,
        "provider" text NOT NULL,
        "providerAccountId" text NOT NULL,
        "refresh_token" text,
        "access_token" text,
        "expires_at" integer,
        "token_type" text,
        "scope" text,
        "id_token" text,
        "session_state" text,
        PRIMARY KEY ("provider", "providerAccountId")
    )
  `);

  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
