import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { generateHashedPassword } from "@/lib/db/utils";
import { ChatSDKError } from "@/lib/errors";

export async function getUser(email: string) {
	try {
		return await db.select().from(user).where(eq(user.email, email));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to get user by email",
		);
	}
}

export async function createUser(email: string, password: string) {
	const hashedPassword = await generateHashedPassword(password);

	try {
		return await db.insert(user).values({ email, password: hashedPassword });
	} catch (_error) {
		throw new ChatSDKError("bad_request:database", "Failed to create user");
	}
}
