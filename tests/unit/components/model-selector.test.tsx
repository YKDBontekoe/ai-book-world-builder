import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import {
	getModelPreferences,
	toggleFavoriteModelAction,
	trackRecentModel,
	updateFavoriteModelsAction,
} from "@/app/actions/model-preferences";
import { ModelSelectorCompact } from "@/components/organisms/chat/multimodal-input/model-selector";
import type { ChatModel } from "@/lib/ai/models";

if (!Element.prototype.hasPointerCapture) {
	Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.releasePointerCapture) {
	Element.prototype.releasePointerCapture = () => undefined;
}

if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => undefined;
}

const createUser = () => userEvent.setup({ pointerEventsCheck: 0 });

// Mock using relative paths to match what the component uses (or just to bypass alias issues)
vi.mock("@/app/actions/model-preferences", () => ({
	getModelPreferences: vi.fn(),
	toggleFavoriteModelAction: vi.fn(),
	trackRecentModel: vi.fn(),
	updateFavoriteModelsAction: vi.fn(),
}));

vi.mock("@/app/(chat)/actions", () => ({
	saveChatModelAsCookie: vi.fn(),
}));

function createDeferred<T>() {
	let resolve: (value: T) => void;
	let reject: (reason?: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve: resolve!, reject: reject! };
}

async function openSelector(user: ReturnType<typeof userEvent.setup>) {
	const [trigger] = screen.getAllByRole("combobox");
	await user.click(trigger);
	await waitFor(() => expect(screen.getByTestId("model-list")).toBeTruthy());
}

const models: ChatModel[] = [
	{
		id: "fast-model",
		name: "Fast Model",
		provider: "openai",
		gatewayId: "openai/fast-model",
		description: "Speedy",
		supportsImages: false,
		reasoning: false,
		pricing: { input: "12.00", output: "12.50" },
	},
	{
		id: "vision-model",
		name: "Vision Model",
		provider: "openai",
		gatewayId: "openai/vision-model",
		description: "Vision",
		supportsImages: true,
		pricing: { input: "8.00", output: "8.50" },
	},
	{
		id: "budget-model",
		name: "Budget Model",
		provider: "openai",
		gatewayId: "openai/budget-model",
		description: "Affordable",
		supportsImages: false,
		reasoning: true,
		pricing: { input: "0.000005", output: "0.00001" },
	},
];

describe("ModelSelectorCompact", () => {
	const mockGetPreferences = getModelPreferences as unknown as Mock;
	const mockToggleFavorite = toggleFavoriteModelAction as unknown as Mock;
	const mockTrackRecent = trackRecentModel as unknown as Mock;
	const mockUpdateFavorites = updateFavoriteModelsAction as unknown as Mock;

	beforeEach(() => {
		vi.resetAllMocks();
		mockGetPreferences.mockResolvedValue({
			success: true,
			data: {
				favoriteModels: [],
				recentModels: [],
				modelPreferences: {
					light: "fast-model",
					middle: "vision-model",
					large: "budget-model",
				},
			},
		});
		mockToggleFavorite.mockResolvedValue({
			success: true,
			data: {
				favoriteModels: [],
				isFavorite: true,
			},
		});
		mockTrackRecent.mockResolvedValue({ success: true, data: undefined });
		mockUpdateFavorites.mockResolvedValue({ success: true, data: [] });
		(saveChatModelAsCookie as unknown as Mock).mockResolvedValue(undefined);
	});

	it("shows favorite toggle state optimistically", async () => {
		const user = createUser();
		const toggleDeferred = createDeferred<any>();
		mockToggleFavorite.mockReturnValue(toggleDeferred.promise);

		render(
			<ModelSelectorCompact
				availableModels={models}
				selectedModelId={models[0].id}
			/>,
		);

		await openSelector(user);

		await waitFor(() =>
			expect(screen.getByTestId("model-card-fast-model")).toBeTruthy(),
		);

		const favoriteButton = within(
			screen.getByTestId("model-card-fast-model"),
		).getByTestId("favorite-toggle");

		await user.click(favoriteButton);

		expect(favoriteButton.getAttribute("aria-pressed")).toBe("true");

		await act(async () => {
			toggleDeferred.resolve({
				success: true,
				data: {
					favoriteModels: ["fast-model"],
					isFavorite: true,
				},
			});
			await toggleDeferred.promise;
		});
	});

	it("uses configured model preferences when available", async () => {
		const user = createUser();
		// Mock preferences with specific models
		mockGetPreferences.mockResolvedValue({
			success: true,
			data: {
				favoriteModels: [],
				recentModels: [],
				modelPreferences: { light: "vision-model", middle: null, large: null },
			},
		});

		render(
			<ModelSelectorCompact
				availableModels={models}
				selectedModelId={models[0].id}
			/>,
		);

		await openSelector(user);

		// Should see vision-model because it is in modelPreferences
		await waitFor(() => {
			expect(screen.getByTestId("model-card-vision-model")).toBeTruthy();
		});
	});
});
