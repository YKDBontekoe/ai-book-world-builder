
import { describe, it, expect, vi } from "vitest";
import { projectRepository } from "@/lib/db/repositories";
import { getScenesData } from "@/app/actions/scene-data";
import { auth } from "@/app/(auth)/auth";

vi.mock("@/app/(auth)/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  projectRepository: {
    findByIdWithAccess: vi.fn(),
  },
  sceneRepository: {
    findByProject: vi.fn(),
  },
}));

vi.mock("@/lib/db/drizzle", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
  },
}));

describe("getScenesData", () => {
  it("should return empty array if user is not the owner of the project", async () => {
    // Arrange
    const projectId = "project-1";
    const userId = "user-1";
    const otherUserId = "user-2";

    vi.mocked(auth).mockResolvedValue({
      user: { id: otherUserId },
    } as any);

    vi.mocked(projectRepository.findByIdWithAccess).mockResolvedValue({
      id: projectId,
      userId: userId,
      name: "Test Project",
      description: "",
      visibility: "private",
      folders: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastViewedSceneId: null,
      forkedFromId: null,
    });

    // Act
    const result = await getScenesData(projectId);

    // Assert
    expect(result).toEqual([]);
  });

  it("should return scene data if user is the owner of the project", async () => {
    // Arrange
    const projectId = "project-1";
    const userId = "user-1";

    vi.mocked(auth).mockResolvedValue({
      user: { id: userId },
    } as any);

    vi.mocked(projectRepository.findByIdWithAccess).mockResolvedValue({
      id: projectId,
      userId: userId,
      name: "Test Project",
      description: "",
      visibility: "private",
      folders: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastViewedSceneId: null,
      forkedFromId: null,
    });

    // Act
    await getScenesData(projectId);

    // Assert
    expect(projectRepository.findByIdWithAccess).toHaveBeenCalledWith(projectId, userId);
  });
});
