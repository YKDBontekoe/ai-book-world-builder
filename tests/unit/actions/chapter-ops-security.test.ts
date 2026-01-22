import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocks must be hoisted
const {
	mockWithProjectWriteAccess,
	mockDb,
	mockEq,
	mockMax,
	mockRevalidatePath,
	mockAuth,
} = vi.hoisted(() => ({
	mockWithProjectWriteAccess: vi.fn(),
	mockDb: {
		transaction: vi.fn(),
		update: vi.fn(),
		select: vi.fn(),
		insert: vi.fn(),
		delete: vi.fn(),
	},
	mockEq: vi.fn(),
	mockMax: vi.fn(),
	mockRevalidatePath: vi.fn(),
	mockAuth: vi.fn(),
}));

// Mock modules
vi.mock("@/lib/actions-utils", () => ({
	withProjectWriteAccess: mockWithProjectWriteAccess,
}));

vi.mock("@/lib/db", () => ({
	db: mockDb,
}));

vi.mock("drizzle-orm", () => ({
	eq: mockEq,
	and: vi.fn(),
	gt: vi.fn(),
	max: mockMax,
	sql: vi.fn(),
}));

vi.mock("next/cache", () => ({
	revalidatePath: mockRevalidatePath,
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: mockAuth,
}));

// Import action
import { updateChapterAction } from "@/app/actions/chapter-ops";

describe("Chapter Ops Security", () => {
	const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";
	const CHAPTER_ID = "123e4567-e89b-12d3-a456-426614174001";
	const ATTACKER_ID = "attacker-123";

	beforeEach(() => {
		vi.clearAllMocks();
		mockAuth.mockResolvedValue({ user: { id: ATTACKER_ID } });

		// Setup successful project access check
		mockWithProjectWriteAccess.mockImplementation((projectId, callback) => {
			return callback({
				project: { id: projectId, userId: ATTACKER_ID },
				user: { id: ATTACKER_ID },
			});
		});

		// Setup generic db mock chaining
		mockDb.update.mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue({}),
			}),
		});
	});

	it("should include projectId in the update query to prevent IDOR", async () => {
		// Arrange
		const input = {
			projectId: PROJECT_ID,
			chapterId: CHAPTER_ID,
			data: {
				title: "Hacked Title",
			},
		};

		// Act
		await updateChapterAction(input);

		// Assert
		// We expect `eq(chapter.projectId, input.projectId)` to be called.

		const eqCalls = mockEq.mock.calls;
		// Verify we check for project ownership by ensuring one of the eq calls
		// checks the projectId column against our PROJECT_ID.
		// The first argument to eq is typically the column object/definition.
		// Since we don't have the real column object here (it's from the schema import),
		// we check if the column name or string representation is correct, or just verify the value match
		// is paired with something that looks like the column we expect if possible.
		// Given we mocked Drizzle, args[0] is the column.
		// We'll trust that the code uses the correct column, but we MUST verify the value match.
		// To be more robust as requested, we check that args[0] is likely the column (truthy)
		// and args[1] is the PROJECT_ID.
		const projectIdCheck = eqCalls.some((args) => {
			// args[0] is the column, args[1] is the value
			// We check if args[0] exists (is the column) and args[1] matches the project ID.
			// Ideally we would check args[0].name === 'projectId' but that depends on implementation details of the column object.
			return args[0] && args[1] === PROJECT_ID;
		});

		expect(projectIdCheck).toBe(true);
	});
});
