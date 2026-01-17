import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createPasskeyChallenge,
	createPasskeyCredential,
	deletePasskeyChallenge,
	getPasskeyChallenge,
	getPasskeyCredentialByCredentialId,
	listPasskeyCredentialsByUserId,
	updatePasskeyCredentialCounter,
} from "@/lib/db/queries/passkeys";
import { ChatSDKError } from "@/lib/errors";
import { db } from "@/lib/db";

vi.mock("@/lib/db", async () => {
	const { createMockDb } = await import("../repositories/mock-db-helper");
	return {
		db: createMockDb(),
	};
});

vi.mock("drizzle-orm", () => ({
	and: vi.fn(),
	eq: vi.fn(),
}));

describe("passkey queries", () => {
	const dbMocks = db as any;

	beforeEach(() => {
		vi.clearAllMocks();
		dbMocks.result = [];
		dbMocks.results = null;
		dbMocks.error = null;
	});

	describe("createPasskeyChallenge", () => {
		it("creates a new challenge after clearing existing ones", async () => {
			await createPasskeyChallenge(
				"user-1",
				"registration",
				"challenge-value",
				new Date("2025-01-01T00:00:00Z"),
			);

			expect(dbMocks.delete).toHaveBeenCalled();
			expect(dbMocks.insert).toHaveBeenCalled();
			expect(dbMocks.values).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: "user-1",
					type: "registration",
					challenge: "challenge-value",
				}),
			);
		});

		it("throws ChatSDKError when db insert fails", async () => {
			dbMocks.error = new Error("db failed");

			await expect(
				createPasskeyChallenge(
					"user-1",
					"registration",
					"challenge-value",
					new Date(),
				),
			).rejects.toThrow(ChatSDKError);
		});
	});

	describe("getPasskeyChallenge", () => {
		it("returns the latest challenge when found", async () => {
			const mockChallenge = {
				id: "challenge-1",
				userId: "user-1",
				type: "authentication",
			};
			dbMocks.result = [mockChallenge];

			const result = await getPasskeyChallenge("user-1", "authentication");
			expect(result).toEqual(mockChallenge);
		});

		it("returns null when no challenge exists", async () => {
			dbMocks.result = [];
			const result = await getPasskeyChallenge("user-1", "registration");
			expect(result).toBeNull();
		});
	});

	describe("deletePasskeyChallenge", () => {
		it("deletes the challenge by id", async () => {
			await deletePasskeyChallenge("challenge-1");
			expect(dbMocks.delete).toHaveBeenCalled();
			expect(dbMocks.where).toHaveBeenCalled();
		});

		it("throws ChatSDKError on db error", async () => {
			dbMocks.error = new Error("db failed");
			await expect(deletePasskeyChallenge("challenge-1")).rejects.toThrow(
				ChatSDKError,
			);
		});
	});

	describe("listPasskeyCredentialsByUserId", () => {
		it("returns credentials for user", async () => {
			const credentials = [{ id: "cred-1" }];
			dbMocks.result = credentials;
			const result = await listPasskeyCredentialsByUserId("user-1");
			expect(result).toEqual(credentials);
		});

		it("throws ChatSDKError on db error", async () => {
			dbMocks.error = new Error("db failed");
			await expect(listPasskeyCredentialsByUserId("user-1")).rejects.toThrow(
				ChatSDKError,
			);
		});
	});

	describe("getPasskeyCredentialByCredentialId", () => {
		it("returns credential when found", async () => {
			const credential = { id: "cred-1", credentialId: "cred-id" };
			dbMocks.result = [credential];
			const result = await getPasskeyCredentialByCredentialId("cred-id");
			expect(result).toEqual(credential);
		});

		it("returns null when not found", async () => {
			dbMocks.result = [];
			const result = await getPasskeyCredentialByCredentialId("cred-id");
			expect(result).toBeNull();
		});
	});

	describe("createPasskeyCredential", () => {
		it("inserts a new credential record", async () => {
			await createPasskeyCredential({
				userId: "user-1",
				credentialId: "cred-id",
				publicKey: "public-key",
				counter: 10,
				transports: ["internal"],
			});

			expect(dbMocks.insert).toHaveBeenCalled();
			expect(dbMocks.values).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: "user-1",
					credentialId: "cred-id",
					publicKey: "public-key",
					counter: 10,
				}),
			);
		});

		it("throws ChatSDKError on db error", async () => {
			dbMocks.error = new Error("db failed");
			await expect(
				createPasskeyCredential({
					userId: "user-1",
					credentialId: "cred-id",
					publicKey: "public-key",
					counter: 10,
					transports: [],
				}),
			).rejects.toThrow(ChatSDKError);
		});
	});

	describe("updatePasskeyCredentialCounter", () => {
		it("updates the credential counter", async () => {
			await updatePasskeyCredentialCounter("cred-1", 5);
			expect(dbMocks.update).toHaveBeenCalled();
			expect(dbMocks.set).toHaveBeenCalledWith({ counter: 5 });
		});

		it("throws ChatSDKError on db error", async () => {
			dbMocks.error = new Error("db failed");
			await expect(
				updatePasskeyCredentialCounter("cred-1", 5),
			).rejects.toThrow(ChatSDKError);
		});
	});
});
