import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/drizzle";

async function main() {
	const res = await db.execute(
		sql`SELECT * FROM information_schema.tables WHERE table_name = 'Account'`,
	);
	console.log("Result:", res);
	process.exit(0);
}
main();
