import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import {
	getModelPreferences,
	toggleFavoriteModelAction,
	trackRecentModel,
	updateFavoriteModelsAction,
} from "@/app/actions/model-preferences";
import { useModelPreferences } from "@/hooks/use-model-preferences";

vi.mock("@/app/actions/model-preferences", () => ({
	getModelPreferences: vi.fn(),
	toggleFavoriteModelAction: vi.fn(),
	trackRecentModel: vi.fn(),
	updateFavoriteModelsAction: vi.fn(),
}));

function createDeferred<T>() {
	let resolve: (value: T) => void;
	let reject: (reason?: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	if (!resolve || !reject) {
		throw new Error("Failed to initialize promise capability");
	}

	return { promise, resolve, reject };
}

describe("useModelPreferences", () => {
	const mockGetPreferences = getModelPreferences as unknown as Mock;
	const mockToggleFavorite = toggleFavoriteModelAction as unknown as Mock;
	const mockTrackRecent = trackRecentModel as unknown as Mock;
	const mockUpdateFavorites = updateFavoriteModelsAction as unknown as Mock;

	beforeEach(() => {
		vi.resetAllMocks();
		mockGetPreferences.mockResolvedValue({
			favoriteModels: [],
			recentModels: [],
		});
		mockToggleFavorite.mockResolvedValue({
			favoriteModels: [],
			isFavorite: true,
		});
		mockTrackRecent.mockResolvedValue(undefined);
		mockUpdateFavorites.mockResolvedValue([]);
	});

	it("loads preferences on mount", async () => {
		mockGetPreferences.mockResolvedValue({
			favoriteModels: ["model-1"],
			recentModels: ["recent-1"],
		});

		const { result } = renderHook(() => useModelPreferences());

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.favoriteModels).toEqual(["model-1"]);
		expect(result.current.recentModels).toEqual(["recent-1"]);
	});

	it("optimistically toggles favorites and updates from the server", async () => {
		const toggleDeferred = createDeferred<{
			favoriteModels: string[];
			isFavorite: boolean;
		}>();
		mockToggleFavorite.mockReturnValue(toggleDeferred.promise);

		const { result } = renderHook(() => useModelPreferences());
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await act(async () => {
			result.current.toggleFavorite("model-2");
		});

		await waitFor(() =>
			expect(result.current.favoriteModels).toContain("model-2"),
		);

		await act(async () => {
			toggleDeferred.resolve({ favoriteModels: ["model-2"], isFavorite: true });
			await toggleDeferred.promise;
		});

		expect(result.current.favoriteModels).toEqual(["model-2"]);
		expect(mockToggleFavorite).toHaveBeenCalledWith("model-2");
	});

	it("tracks recent models and enforces the max size", async () => {
		const { result } = renderHook(() => useModelPreferences({ maxRecent: 2 }));
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await act(async () => result.current.recordRecentModel("model-a"));
		await act(async () => result.current.recordRecentModel("model-b"));
		await act(async () => result.current.recordRecentModel("model-c"));

		await waitFor(() =>
			expect(result.current.recentModels).toEqual(["model-c", "model-b"]),
		);
		await waitFor(() =>
			expect(mockTrackRecent).toHaveBeenCalledWith("model-c"),
		);
	});
});
