import { generateId } from "ai";
import { genSalt, genSaltSync, hash, hashSync } from "bcrypt-ts";

/**
 * Asynchronously generates a hashed password.
 * Use this for runtime operations (e.g., user registration) to avoid blocking the event loop.
 */
export async function generateHashedPassword(password: string) {
	const salt = await genSalt(10);
	return await hash(password, salt);
}

/**
 * Synchronously generates a hashed password.
 * Use ONLY for initialization scripts or constants where async is not possible.
 */
export function generateHashedPasswordSync(password: string) {
	const salt = genSaltSync(10);
	return hashSync(password, salt);
}

export function generateDummyPassword() {
	const password = generateId();
	// Must use sync here because this is often called at module level (e.g. constants.ts)
	return generateHashedPasswordSync(password);
}
