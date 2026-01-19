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

export async function createPasskeyChallenge(
	userId: string,
	type: PasskeyChallengeType,
	challenge: string,
	expiresAt: Date,
): Promise<void> {
	try {
		await db
			.delete(passkeyChallenge)
			.where(
				and(
					eq(passkeyChallenge.userId, userId),
					eq(passkeyChallenge.type, type),
				),
			);

		await db.insert(passkeyChallenge).values({
			userId,
			type,
			challenge,
			expiresAt,
			createdAt: new Date(),
		});
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create passkey challenge",
		);
	}
}

export async function getPasskeyChallenge(
	userId: string,
	type: PasskeyChallengeType,
): Promise<PasskeyChallenge | null> {
	try {
		const [challenge] = await db
			.select()
			.from(passkeyChallenge)
			.where(
				and(
					eq(passkeyChallenge.userId, userId),
					eq(passkeyChallenge.type, type),
				),
			);
		return challenge ?? null;
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to get passkey challenge",
		);
	}
}

export async function deletePasskeyChallenge(id: string): Promise<void> {
	try {
		await db.delete(passkeyChallenge).where(eq(passkeyChallenge.id, id));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to delete passkey challenge",
		);
	}
}

export async function listPasskeyCredentialsByUserId(
	userId: string,
): Promise<PasskeyCredential[]> {
	try {
		return await db
			.select()
			.from(passkeyCredential)
			.where(eq(passkeyCredential.userId, userId));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to list passkey credentials",
		);
	}
}

export async function getPasskeyCredentialByCredentialId(
	credentialId: string,
): Promise<PasskeyCredential | null> {
	try {
		const [credential] = await db
			.select()
			.from(passkeyCredential)
			.where(eq(passkeyCredential.credentialId, credentialId));
		return credential ?? null;
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to get passkey credential",
		);
	}
}

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
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create passkey credential",
		);
	}
}

export async function updatePasskeyCredentialCounter(
	id: string,
	counter: number,
): Promise<void> {
	try {
		await db
			.update(passkeyCredential)
			.set({ counter })
			.where(eq(passkeyCredential.id, id));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to update passkey counter",
		);
	}
}
