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
			return callback({ project: { id: projectId, userId: ATTACKER_ID }, user: { id: ATTACKER_ID } });
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
		const projectIdCheck = eqCalls.some(args => {
			 return args[1] === PROJECT_ID;
		});

		expect(projectIdCheck).toBe(true);
	});
});
