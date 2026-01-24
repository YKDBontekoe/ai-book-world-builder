import { act, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSceneOperations } from "@/features/writer/hooks/use-scene-operations";
import * as actions from "@/features/writer/actions";
import { toast } from "sonner";
import type { ChapterWithScenes } from "@/lib/types";

// Mock actions
vi.mock("@/features/writer/actions", () => ({
	generateScene: vi.fn(),
	createSceneInChapter: vi.fn(),
	updateSceneTitle: vi.fn(),
	deleteScene: vi.fn(),
	bulkDeleteScenes: vi.fn(),
	createNewChapter: vi.fn(),
	updateChapterTitle: vi.fn(),
	deleteChapter: vi.fn(),
}));

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		loading: vi.fn().mockReturnValue("toast-id"),
		success: vi.fn(),
		error: vi.fn(),
		dismiss: vi.fn(),
		custom: vi.fn().mockReturnValue("undo-toast-id"),
	},
}));

const mockProjectId = "project-1";
const mockStructure: ChapterWithScenes[] = [
	{
		id: "chapter-1",
		projectId: mockProjectId,
		title: "Chapter 1",
		sequence: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
		scenes: [
			{
				id: "scene-1",
				chapterId: "chapter-1",
				projectId: mockProjectId,
				title: "Scene 1",
				sequence: 1,
				content: "Content",
				status: "drafted",
				prevSceneId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		],
	},
];

describe("useSceneOperations", () => {
	const onSceneSelect = vi.fn();
	const onStructureUpdate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should handle generation state correctly", async () => {
		const { result } = renderHook(() =>
			useSceneOperations({
				projectId: mockProjectId,
				activeSceneId: null,
				onSceneSelect,
				onStructureUpdate,
				structure: mockStructure,
			}),
		);

		(actions.generateScene as any).mockResolvedValueOnce({
			success: true,
			sceneId: "new-scene",
		});

		let promise: Promise<void>;
		act(() => {
			promise = result.current.handleGenerateNextScene("chapter-1");
		});

		expect(result.current.isGenerating).toBe(true);
		expect(toast.loading).toHaveBeenCalledWith("Generating new scene...");

		await act(async () => {
			await promise!;
		});

		expect(result.current.isGenerating).toBe(false);
		expect(toast.success).toHaveBeenCalledWith("Scene generated!", {
			id: "toast-id",
		});
		expect(onStructureUpdate).toHaveBeenCalled();
	});

	it("should handle generation failure", async () => {
		const { result } = renderHook(() =>
			useSceneOperations({
				projectId: mockProjectId,
				activeSceneId: null,
				onSceneSelect,
				onStructureUpdate,
				structure: mockStructure,
			}),
		);

		(actions.generateScene as any).mockResolvedValueOnce({
			success: false,
			error: "Failed",
		});

		await act(async () => {
			await result.current.handleGenerateNextScene("chapter-1");
		});

		expect(toast.error).toHaveBeenCalledWith("Generation failed", {
			id: "toast-id",
		});
		expect(result.current.isGenerating).toBe(false);
	});

	it("should create scene manually and select it", async () => {
		const { result } = renderHook(() =>
			useSceneOperations({
				projectId: mockProjectId,
				activeSceneId: null,
				onSceneSelect,
				onStructureUpdate,
				structure: mockStructure,
			}),
		);

		(actions.createSceneInChapter as any).mockResolvedValueOnce({
			success: true,
			sceneId: "manual-scene",
		});

		await act(async () => {
			await result.current.handleCreateSceneManually("chapter-1");
		});

		expect(toast.success).toHaveBeenCalledWith("Scene created", {
			id: "toast-id",
		});
		expect(onStructureUpdate).toHaveBeenCalled();
		expect(onSceneSelect).toHaveBeenCalledWith("manual-scene");
	});

	it("should perform optimistic delete and execute after delay", async () => {
		const { result } = renderHook(() =>
			useSceneOperations({
				projectId: mockProjectId,
				activeSceneId: "scene-1", // Active scene
				onSceneSelect,
				onStructureUpdate,
				structure: mockStructure,
			}),
		);

		(actions.bulkDeleteScenes as any).mockResolvedValueOnce({ success: true });

		act(() => {
			result.current.handleDeleteScene("scene-1");
		});

		// Immediate optimistic update
		expect(result.current.deletedSceneIds.has("scene-1")).toBe(true);
		// Should deselect active scene if it's the one being deleted
		expect(onSceneSelect).toHaveBeenCalledWith(null);
		// Should show undo toast
		expect(toast.custom).toHaveBeenCalled();

		// Fast-forward time
		await act(async () => {
			vi.runAllTimers();
		});

		expect(actions.bulkDeleteScenes).toHaveBeenCalledWith(["scene-1"]);
		expect(onStructureUpdate).toHaveBeenCalled();
	});

	it("should allow undoing deletion", async () => {
		const { result } = renderHook(() =>
			useSceneOperations({
				projectId: mockProjectId,
				activeSceneId: null,
				onSceneSelect,
				onStructureUpdate,
				structure: mockStructure,
			}),
		);

		act(() => {
			result.current.handleDeleteScene("scene-1");
		});

		expect(result.current.deletedSceneIds.has("scene-1")).toBe(true);

		// Extract the Undo function passed to toast.custom
		// The mock calls: toast.custom((t) => JSX, ...)
		const toastCall = (toast.custom as any).mock.calls[0];
		const renderToast = toastCall[0];
		const dummyToastId = "undo-toast-id"; // Match the mocked return value from toast.custom

		// Render the component returned by the toast callback
		const toastComponent = renderToast(dummyToastId);
		const { getByText } = render(toastComponent);
		const undoButton = getByText("Undo");

		act(() => {
			undoButton.click();
		});

		// Verify undo effect
		expect(result.current.deletedSceneIds.has("scene-1")).toBe(false);
		expect(toast.dismiss).toHaveBeenCalledWith(dummyToastId);

		// Verify timer was cleared (by advancing time and seeing NO call to bulkDeleteScenes)
		await act(async () => {
			vi.runAllTimers();
		});
		expect(actions.bulkDeleteScenes).not.toHaveBeenCalled();
	});

    it("should rollback deletion on failure", async () => {
		const { result } = renderHook(() =>
			useSceneOperations({
				projectId: mockProjectId,
				activeSceneId: null,
				onSceneSelect,
				onStructureUpdate,
				structure: mockStructure,
			}),
		);

		(actions.bulkDeleteScenes as any).mockResolvedValueOnce({ success: false, error: "Fail" });

		act(() => {
			result.current.handleDeleteScene("scene-1");
		});

        expect(result.current.deletedSceneIds.has("scene-1")).toBe(true);

		await act(async () => {
			vi.runAllTimers();
		});

        // Should have attempted delete
		expect(actions.bulkDeleteScenes).toHaveBeenCalledWith(["scene-1"]);

        // Should show error
        expect(toast.error).toHaveBeenCalledWith("Failed to delete scenes");

        // Should revert state
		expect(result.current.deletedSceneIds.has("scene-1")).toBe(false);
    });

	it("should cleanup deletedSceneIds when structure updates", async () => {
		const { result, rerender } = renderHook(
			({ structure }) =>
				useSceneOperations({
					projectId: mockProjectId,
					activeSceneId: null,
					onSceneSelect,
					onStructureUpdate,
					structure,
				}),
			{ initialProps: { structure: mockStructure } },
		);

        // Simulate a delete that is pending/optimistic
		act(() => {
			result.current.performDelete(["scene-1"]);
		});
        expect(result.current.deletedSceneIds.has("scene-1")).toBe(true);

		// Now simulate structure update where scene-1 is actually gone (confirmed delete)
        const newStructure = [{ ...mockStructure[0], scenes: [] }];

		rerender({ structure: newStructure });

        // The hook logic says: if id is NOT in current structure, remove it from deletedSceneIds?
        // Let's check code:
        /*
        for (const id of prev) {
            if (!currentIds.has(id)) {
                next.delete(id);
                changed = true;
            }
        }
        */
        // Yes, if it's not in structure, it means it's gone for good, so we don't need to track it as "pending delete" anymore.

		expect(result.current.deletedSceneIds.has("scene-1")).toBe(false);
	});
});
