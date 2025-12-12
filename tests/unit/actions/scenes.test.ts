import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
	updateScene: vi.fn(),
	getProjectByIdWithAccess: vi.fn(),
}));

import { auth } from "@/app/(auth)/auth";
import { updateSceneAction } from "@/app/actions/scenes";
import { getProjectByIdWithAccess, updateScene } from "@/lib/db/queries";
import type { Project, Scene } from "@/lib/db/schema";

const mockedAuth = vi.mocked(auth);
const mockedGetProjectByIdWithAccess = vi.mocked(getProjectByIdWithAccess);
const mockedUpdateScene = vi.mocked(updateScene);

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
		const scene = buildScene();
		const updatedScene = buildScene({ title: "Updated Title" });

		mockedAuth.mockResolvedValue(buildSession());
		mockedGetProjectByIdWithAccess.mockResolvedValue(buildProject());
		mockedUpdateScene.mockResolvedValue(updatedScene);

		const result = await updateSceneAction({
			id: sceneId,
			title: "Updated Title",
			projectId,
		});

		expect(mockedGetProjectByIdWithAccess).toHaveBeenCalledWith({
			id: projectId,
			userId,
		});
		// We expect projectId to be passed to updateScene as part of the fix
		expect(mockedUpdateScene).toHaveBeenCalledWith({
			id: sceneId,
			title: "Updated Title",
			status: undefined,
			content: undefined,
			projectId,
		});
		expect(result.title).toBe("Updated Title");
	});

	it("throws when the project is inaccessible", async () => {
		mockedAuth.mockResolvedValue(buildSession());
		mockedGetProjectByIdWithAccess.mockResolvedValue(null);

		await expect(updateSceneAction({ id: sceneId, projectId })).rejects.toThrow(
			"Unauthorized",
		);

		expect(mockedUpdateScene).not.toHaveBeenCalled();
	});

	it("throws when the project is public but owned by someone else", async () => {
		mockedAuth.mockResolvedValue(buildSession());
		// Public project owned by someone else
		mockedGetProjectByIdWithAccess.mockResolvedValue(
			buildProject({ userId: "other-user", visibility: "public" }),
		);

		await expect(updateSceneAction({ id: sceneId, projectId })).rejects.toThrow(
			"Unauthorized",
		);

		expect(mockedUpdateScene).not.toHaveBeenCalled();
	});
});
