import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/app/(auth)/auth";
import { saveGameState } from "../../../src/features/factory-tycoon/actions";
import { INITIAL_STATE } from "../../../src/features/factory-tycoon/config";
import type { GameState } from "../../../src/features/factory-tycoon/types";

// Mock Auth
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

// Mock DB with hoisted variables
const { mockFindFirst, mockValues, mockSet, mockWhere } = vi.hoisted(() => ({
	mockFindFirst: vi.fn(),
	mockValues: vi.fn(),
	mockSet: vi.fn(),
	mockWhere: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
	db: {
		query: {
			factoryTycoonSaves: {
				findFirst: mockFindFirst,
			},
		},
		insert: vi.fn(() => ({ values: mockValues })),
		update: vi.fn(() => ({ set: mockSet })),
	},
}));

describe("Factory Tycoon Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Setup successful auth
		const mockSession: Session = {
			user: { id: "user-1", name: "Test User", email: "test@example.com" },
			expires: new Date().toISOString(),
		};
		vi.mocked(auth).mockResolvedValue(mockSession);

		// Setup chainable mocks
		mockSet.mockReturnValue({ where: mockWhere });
	});

	it("saveGameState should reject invalid schema (wrong type)", async () => {
		const invalidState = {
			...INITIAL_STATE,
			cash: "LOTS OF MONEY",
		} satisfies Partial<unknown> as unknown as GameState; // Invalid string
		const result = await saveGameState(invalidState);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeDefined();
			// Zod error usually says "Expected number, received string"
		}
	});

	it("saveGameState should reject missing required fields", async () => {
		const invalidState = {
			cash: 100,
		} satisfies Partial<unknown> as unknown as GameState; // Missing everything else
		const result = await saveGameState(invalidState);

		expect(result.success).toBe(false);
	});

	it("saveGameState should insert new save when none exists", async () => {
		mockFindFirst.mockResolvedValue(null);
		mockValues.mockResolvedValue({});

		const result = await saveGameState(INITIAL_STATE);

		expect(result.success).toBe(true);
		expect(mockFindFirst).toHaveBeenCalled();
		expect(mockValues).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "user-1",
				state: INITIAL_STATE,
			}),
		);
	});

	it("saveGameState should update save when it exists", async () => {
		mockFindFirst.mockResolvedValue({ id: "save-1", userId: "user-1" });
		mockWhere.mockResolvedValue({});

		const result = await saveGameState(INITIAL_STATE);

		expect(result.success).toBe(true);
		expect(mockSet).toHaveBeenCalledWith(
			expect.objectContaining({
				state: INITIAL_STATE,
			}),
		);
		expect(mockWhere).toHaveBeenCalled();
	});
});
