import { randomUUID } from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

// Hoist mocks to avoid execution order issues
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
	sceneRepository: {
		update: vi.fn(),
	},
}));

vi.mock("@/lib/cache", () => ({
	invalidateCache: vi.fn(),
}));

import type { Session } from "next-auth";
import { auth } from "@/app/(auth)/auth";
import { updateSceneAction } from "@/app/actions/scenes";
import { invalidateCache } from "@/lib/cache";
import { projectRepository, sceneRepository } from "@/lib/db/repositories";
import type { Project, Scene } from "@/lib/db/schema";

const mockedAuth = vi.mocked(auth as any);
const mockedFindByIdWithAccess = vi.mocked(
	projectRepository.findByIdWithAccess,
);
const mockedUpdateScene = vi.mocked(sceneRepository.update);
const mockedInvalidateCache = vi.mocked(invalidateCache);

const userId = randomUUID();
const projectId = randomUUID();
const sceneId = randomUUID();

function buildSession(): Session {
	return {
		user: {
			email: null,
			id: userId,
			image: null,
			name: "Test User",
			type: "regular",
			role: "user",
		},
		expires: new Date().toISOString(),
	};
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

	it("updates a scene when the user owns the project and invalidates cache if title changes", async () => {
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
		expect(mockedUpdateScene).toHaveBeenCalledWith(
			sceneId,
			{
				title: "Updated Title",
				status: undefined,
				content: undefined,
			},
			projectId,
		);
		expect(mockedInvalidateCache).toHaveBeenCalledWith(
			`project-structure:${projectId}`,
		);
		expect(result.title).toBe("Updated Title");
	});

	it("updates a scene content but does NOT invalidate structure cache", async () => {
		const updatedScene = buildScene({ content: "New content" });

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindByIdWithAccess.mockResolvedValue(buildProject());
		mockedUpdateScene.mockResolvedValue(updatedScene);

		await updateSceneAction({
			id: sceneId,
			content: "New content",
			projectId,
		});

		expect(mockedUpdateScene).toHaveBeenCalledWith(
			sceneId,
			{
				title: undefined,
				status: undefined,
				content: "New content",
			},
			projectId,
		);
		// Should NOT be called because title was not passed
		expect(mockedInvalidateCache).not.toHaveBeenCalled();
	});

	it("throws when the project is inaccessible", async () => {
		mockedAuth.mockResolvedValue(buildSession());
		mockedFindByIdWithAccess.mockResolvedValue(null);

		await expect(updateSceneAction({ id: sceneId, projectId })).rejects.toThrow(
			"Unauthorized",
		);

		expect(mockedUpdateScene).not.toHaveBeenCalled();
		expect(mockedInvalidateCache).not.toHaveBeenCalled();
	});
});
