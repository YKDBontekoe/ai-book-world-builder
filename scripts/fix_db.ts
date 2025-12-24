import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/drizzle";

async function main() {
	console.log("Fixing UserPreferences duplicates...");
	try {
		await db.execute(sql`
        DELETE FROM "UserPreferences" a USING "UserPreferences" b
        WHERE a.ctid < b.ctid AND a."userId" = b."userId";
      `);
		console.log("Done.");
	} catch (e) {
		console.error(e);
	}
	process.exit(0);
}

main();
