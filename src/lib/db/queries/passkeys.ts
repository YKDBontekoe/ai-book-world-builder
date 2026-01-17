import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	type PasskeyChallenge,
	type PasskeyChallengeType,
	type PasskeyCredential,
	passkeyChallenge,
	passkeyCredential,
} from "@/lib/db/schema/passkeys";
import { ChatSDKError } from "@/lib/errors";

/**
 * Creates a new passkey challenge for a user.
 * Deletes any existing challenge of the same type for the user before creating a new one.
 *
 * @param userId - The ID of the user.
 * @param type - The type of challenge (registration or authentication).
 * @param challenge - The challenge string.
 * @param expiresAt - The expiration date of the challenge.
 */
export async function createPasskeyChallenge(
	userId: string,
	type: PasskeyChallengeType,
	challenge: string,
	expiresAt: Date,
): Promise<void> {
	try {
		await db
			.delete(passkeyChallenge)
			.where(and(eq(passkeyChallenge.userId, userId), eq(passkeyChallenge.type, type)));

		await db.insert(passkeyChallenge).values({
			userId,
			type,
			challenge,
			expiresAt,
			createdAt: new Date(),
		});
	} catch (error) {
		console.error("Failed to create passkey challenge:", error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create passkey challenge",
		);
	}
}

/**
 * Retrieves a passkey challenge for a user.
 *
 * @param userId - The ID of the user.
 * @param type - The type of challenge to retrieve.
 * @returns The passkey challenge or null if not found.
 */
export async function getPasskeyChallenge(
	userId: string,
	type: PasskeyChallengeType,
): Promise<PasskeyChallenge | null> {
	try {
		const [challenge] = await db
			.select()
			.from(passkeyChallenge)
			.where(and(eq(passkeyChallenge.userId, userId), eq(passkeyChallenge.type, type)));
		return challenge ?? null;
	} catch (error) {
		console.error("Failed to get passkey challenge:", error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to get passkey challenge",
		);
	}
}

/**
 * Deletes a passkey challenge by its ID.
 *
 * @param id - The ID of the challenge to delete.
 */
export async function deletePasskeyChallenge(id: string): Promise<void> {
	try {
		await db.delete(passkeyChallenge).where(eq(passkeyChallenge.id, id));
	} catch (error) {
		console.error("Failed to delete passkey challenge:", error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to delete passkey challenge",
		);
	}
}

/**
 * Lists all passkey credentials associated with a user.
 *
 * @param userId - The ID of the user.
 * @returns An array of passkey credentials.
 */
export async function listPasskeyCredentialsByUserId(
	userId: string,
): Promise<PasskeyCredential[]> {
	try {
		return await db
			.select()
			.from(passkeyCredential)
			.where(eq(passkeyCredential.userId, userId));
	} catch (error) {
		console.error("Failed to list passkey credentials:", error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to list passkey credentials",
		);
	}
}

/**
 * Retrieves a passkey credential by its credential ID.
 *
 * @param credentialId - The unique credential ID.
 * @returns The passkey credential or null if not found.
 */
export async function getPasskeyCredentialByCredentialId(
	credentialId: string,
): Promise<PasskeyCredential | null> {
	try {
		const [credential] = await db
			.select()
			.from(passkeyCredential)
			.where(eq(passkeyCredential.credentialId, credentialId));
		return credential ?? null;
	} catch (error) {
		console.error("Failed to get passkey credential:", error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to get passkey credential",
		);
	}
}

/**
 * Creates a new passkey credential.
 *
 * @param data - The passkey credential data.
 * @param data.userId - The ID of the user.
 * @param data.credentialId - The unique credential ID.
 * @param data.publicKey - The public key.
 * @param data.counter - The signature counter.
 * @param data.transports - The supported transports.
 */
export async function createPasskeyCredential(data: {
	userId: string;
	credentialId: string;
	publicKey: string;
	counter: number;
	transports: string[];
}): Promise<void> {
	try {
		await db.insert(passkeyCredential).values({
			userId: data.userId,
			credentialId: data.credentialId,
			publicKey: data.publicKey,
			counter: data.counter,
			transports: data.transports,
			createdAt: new Date(),
		});
	} catch (error) {
		console.error("Failed to create passkey credential:", error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create passkey credential",
		);
	}
}

/**
 * Updates the signature counter for a passkey credential.
 *
 * @param id - The ID of the credential to update.
 * @param counter - The new counter value.
 */
export async function updatePasskeyCredentialCounter(
	id: string,
	counter: number,
): Promise<void> {
	try {
		await db
			.update(passkeyCredential)
			.set({ counter })
			.where(eq(passkeyCredential.id, id));
	} catch (error) {
		console.error("Failed to update passkey counter:", error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to update passkey counter",
		);
	}
}
