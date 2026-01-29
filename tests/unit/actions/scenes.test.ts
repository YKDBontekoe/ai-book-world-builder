import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

// Use vi.hoisted to share mock state across different imports
const {
	mockProjectRepository,
	mockSceneRepository,
	mockInvalidateCache,
	mockRevalidatePath,
	mockAuth,
} = vi.hoisted(() => ({
	mockProjectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	mockSceneRepository: {
		update: vi.fn(),
	},
	mockInvalidateCache: vi.fn(),
	mockRevalidatePath: vi.fn(),
	mockAuth: vi.fn(),
}));

// Mock specific repository files
vi.mock("@/lib/db/repositories/project-repository", () => ({
	projectRepository: mockProjectRepository,
}));

vi.mock("@/lib/db/repositories/scene-repository", () => ({
	sceneRepository: mockSceneRepository,
}));

// Mock the index
vi.mock("@/lib/db/repositories", () => ({
	projectRepository: mockProjectRepository,
	sceneRepository: mockSceneRepository,
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: mockAuth,
}));

vi.mock("@/lib/cache", () => ({
	invalidateCache: mockInvalidateCache,
}));

vi.mock("next/cache", () => ({
	revalidatePath: mockRevalidatePath,
}));

// Import the action under test
import { updateSceneAction } from "@/app/actions/scenes";
import type { Project, Scene } from "@/lib/db/schema";
import { isOk } from "@/lib/result";

const userId = "user-123";
const projectId = "123e4567-e89b-12d3-a456-426614174000";
const sceneId = "123e4567-e89b-12d3-a456-426614174001";

function buildSession() {
	return {
		user: {
			email: null,
			id: userId,
			image: null,
			name: "Test User",
			type: "regular",
		},
		expires: new Date().toISOString(),
	} as any;
}

function buildProject(overrides?: Partial<Project>): Project {
	return {
		id: projectId,
		name: "Test Project",
		description: null,
		userId,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		visibility: "private",
		folders: [],
		...overrides,
	} as Project;
}

function buildScene(overrides?: Partial<Scene>): Scene {
	return {
		id: sceneId,
		title: "Test Scene",
		sequence: 1,
		content: "Scene content",
		status: "planned",
		chapterId: "chapter-123",
		projectId,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-02T00:00:00Z"),
		...overrides,
	} as Scene;
}

describe("scenes server actions", () => {
	let consoleErrorSpy: MockInstance<Console["error"]>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
		vi.clearAllMocks();
	});

	it("updates a scene when the user owns the project and invalidates cache if title changes", async () => {
		const updatedScene = buildScene({ title: "Updated Title" });

		mockAuth.mockResolvedValue(buildSession());
		mockProjectRepository.findByIdWithAccess.mockResolvedValue(buildProject());
		mockSceneRepository.update.mockResolvedValue(updatedScene);

		const result = await updateSceneAction({
			id: sceneId,
			title: "Updated Title",
			projectId,
		});

		expect(mockProjectRepository.findByIdWithAccess).toHaveBeenCalledWith(
			projectId,
			userId,
		);
		expect(mockSceneRepository.update).toHaveBeenCalledWith(
			sceneId,
			{
				title: "Updated Title",
				status: undefined,
				content: undefined,
			},
			projectId,
		);
		expect(mockInvalidateCache).toHaveBeenCalledWith(
			`project-structure:${projectId}`,
		);
		expect(mockRevalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);

		expect(result.success).toBe(true);
		if (isOk(result)) {
			expect(result.data.title).toBe("Updated Title");
		}
	});

	it("updates a scene content but does NOT invalidate structure cache", async () => {
		const updatedScene = buildScene({ content: "New content" });

		mockAuth.mockResolvedValue(buildSession());
		mockProjectRepository.findByIdWithAccess.mockResolvedValue(buildProject());
		mockSceneRepository.update.mockResolvedValue(updatedScene);

		const result = await updateSceneAction({
			id: sceneId,
			content: "New content",
			projectId,
		});

		expect(mockSceneRepository.update).toHaveBeenCalledWith(
			sceneId,
			{
				title: undefined,
				status: undefined,
				content: "New content",
			},
			projectId,
		);
		expect(mockInvalidateCache).not.toHaveBeenCalled();
		expect(result.success).toBe(true);
	});

	it("returns error when the project is inaccessible", async () => {
		mockAuth.mockResolvedValue(buildSession());
		mockProjectRepository.findByIdWithAccess.mockResolvedValue(null);

		const result = await updateSceneAction({ id: sceneId, projectId });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain("Project not found");
		}

		expect(mockSceneRepository.update).not.toHaveBeenCalled();
		expect(mockInvalidateCache).not.toHaveBeenCalled();
	});

	it("returns Unauthorized when not logged in", async () => {
		mockAuth.mockResolvedValue(null);

		const result = await updateSceneAction({ id: sceneId, projectId });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("You must be logged in to perform this action");
		}

		expect(mockProjectRepository.findByIdWithAccess).not.toHaveBeenCalled();
		expect(mockSceneRepository.update).not.toHaveBeenCalled();
	});
});
