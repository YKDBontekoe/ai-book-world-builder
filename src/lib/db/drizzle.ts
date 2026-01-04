import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

// Filter schema to remove null/undefined values that can cause drizzle-orm to crash
const filteredSchema = Object.fromEntries(
	Object.entries(schema).filter(([_, value]) => value != null),
);

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client, { schema: filteredSchema as typeof schema });
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
