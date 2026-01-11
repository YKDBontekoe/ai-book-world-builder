import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { useSceneContent } from "@/features/writer/hooks/use-scene-content";
import * as sceneActions from "@/features/writer/actions";

// Mock the server action
vi.mock("@/features/writer/actions", () => ({
	getSceneContent: vi.fn(),
	updateSceneContent: vi.fn(),
}));

describe("useSceneContent", () => {
	it("should call getSceneContent with projectId and sceneId", async () => {
		const mockGetSceneContent = vi.spyOn(sceneActions, "getSceneContent");
		mockGetSceneContent.mockResolvedValue({ success: true, content: "Test Content" });

		const projectId = "test-project-id";
		const sceneId = "test-scene-id";

		renderHook(() =>
			useSceneContent({
				projectId,
				activeSceneId: sceneId,
			}),
		);

		await waitFor(() => {
			expect(mockGetSceneContent).toHaveBeenCalledWith(projectId, sceneId);
		});
	});
});
