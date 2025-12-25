import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

// Mock the specific file that actions-utils imports
vi.mock("@/lib/db/repositories/project-repository", () => ({
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
}));

// Mock the index/scene repo as before (actions/scenes imports sceneRepo from index)
vi.mock("@/lib/db/repositories", () => ({
	// actions-utils imports projectRepository from file, but actions/scenes imports from index
	// We need to ensure consistency or mock both if they point to different objects (though they shouldn't in runtime)
	// But in Jest/Vitest, import path matters for mocking.
	// We can try to re-export the mocked object.
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	sceneRepository: {
		update: vi.fn(),
	},
}));

import { auth } from "@/app/(auth)/auth";
import { updateSceneAction } from "@/app/actions/scenes";
// We must import projectRepository from the FILE to spy on it correctly if actions-utils uses the file
import { projectRepository } from "@/lib/db/repositories/project-repository";
import { sceneRepository } from "@/lib/db/repositories"; // Scenes uses index
import type { Project, Scene } from "@/lib/db/schema";
import { isErr, isOk } from "@/lib/result";

const mockedAuth = vi.mocked(auth);
// This should now point to the mocked version from the file mock
const mockedFindByIdWithAccess = vi.mocked(
	projectRepository.findByIdWithAccess,
);
const mockedUpdateScene = vi.mocked(sceneRepository.update);

const userId = "user-123";
const projectId = "project-123";
const sceneId = "scene-123";

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
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("updates a scene when the user owns the project", async () => {
		const updatedScene = buildScene({ title: "Updated Title" });

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindByIdWithAccess.mockResolvedValue(buildProject());
		mockedUpdateScene.mockResolvedValue(updatedScene);

		const result = await updateSceneAction({
			id: sceneId,
			title: "Updated Title",
			projectId,
		});

		expect(mockedFindByIdWithAccess).toHaveBeenCalledWith(projectId, userId);
		expect(mockedUpdateScene).toHaveBeenCalledWith(sceneId, {
			title: "Updated Title",
			status: undefined,
			content: undefined,
		});

		expect(isOk(result)).toBe(true);
		if (isOk(result)) {
			expect(result.data.title).toBe("Updated Title");
		}
	});

	it("returns error when the project is inaccessible", async () => {
		mockedAuth.mockResolvedValue(buildSession());
		mockedFindByIdWithAccess.mockResolvedValue(null);

		const result = await updateSceneAction({ id: sceneId, projectId });

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			// actions-utils throws NotFoundError -> "Project not found" (default error message for NotFound)
			// OR if not found, it might just return error.
			// Let's check what message it returns.
			// ensureProjectAccess throws `NotFoundError.forResource("Project", projectId)`
			// getErrorMessage(NotFoundError) should be the message.
			expect(result.error).toBeTruthy();
		}

		expect(mockedUpdateScene).not.toHaveBeenCalled();
	});

	it("returns error when the project is public but owned by someone else", async () => {
		mockedAuth.mockResolvedValue(buildSession());
		// Public project owned by someone else
		mockedFindByIdWithAccess.mockResolvedValue(
			buildProject({ userId: "other-user", visibility: "public" }),
		);

		const result = await updateSceneAction({ id: sceneId, projectId });

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			// ensureProjectAccess checks (requireOwner && project.userId !== user.id) -> ForbiddenError
			// ForbiddenError -> "Owner access required..."
			expect(result.error).toContain("Owner access required");
		}

		expect(mockedUpdateScene).not.toHaveBeenCalled();
	});
});
