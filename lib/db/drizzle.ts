import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
