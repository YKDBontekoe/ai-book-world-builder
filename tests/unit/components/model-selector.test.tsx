import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModelSelectorCompact } from "@/components/organisms/chat/multimodal-input/model-selector";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import {
        getModelPreferences,
        toggleFavoriteModelAction,
        trackRecentModel,
        updateFavoriteModelsAction,
} from "@/app/actions/model-preferences";
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
        const mockGetPreferences = getModelPreferences as unknown as vi.Mock;
        const mockToggleFavorite = toggleFavoriteModelAction as unknown as vi.Mock;
        const mockTrackRecent = trackRecentModel as unknown as vi.Mock;
        const mockUpdateFavorites = updateFavoriteModelsAction as unknown as vi.Mock;

        beforeEach(() => {
                vi.resetAllMocks();
                mockGetPreferences.mockResolvedValue({ favoriteModels: [], recentModels: [] });
                mockToggleFavorite.mockResolvedValue({ favoriteModels: [], isFavorite: true });
                mockTrackRecent.mockResolvedValue(undefined);
                mockUpdateFavorites.mockResolvedValue([]);
                (saveChatModelAsCookie as unknown as vi.Mock).mockResolvedValue(undefined);
        });

        it("filters models by tab selection", async () => {
                const user = createUser();
                render(<ModelSelectorCompact availableModels={models} selectedModelId={models[0].id} />);

                await openSelector(user);

                await user.click(screen.getByTestId("model-tab-vision"));

                expect(screen.getByTestId("model-card-vision-model")).toBeTruthy();
                expect(screen.queryByTestId("model-card-fast-model")).toBeNull();
                expect(screen.queryByTestId("model-card-budget-model")).toBeNull();
        });

        it("sorts models by price when the sort option changes", async () => {
                const user = createUser();
                render(<ModelSelectorCompact availableModels={models} selectedModelId={models[0].id} />);

                await openSelector(user);

                await user.click(screen.getByTestId("model-sort-menu"));

                const cardNames = screen
                        .getAllByTestId(/model-card-/)
                        .map((card) => within(card).getByText(/Model/).textContent);

                expect(cardNames[0]).toBe("Budget Model");
        });

        it("shows favorite toggle state optimistically", async () => {
                const user = createUser();
                const toggleDeferred = createDeferred<{ favoriteModels: string[]; isFavorite: boolean }>();
                mockToggleFavorite.mockReturnValue(toggleDeferred.promise);

                render(<ModelSelectorCompact availableModels={models} selectedModelId={models[0].id} />);

                await openSelector(user);

                await waitFor(() => expect(screen.getByTestId("model-card-fast-model")).toBeTruthy());

                const favoriteButton = within(screen.getByTestId("model-card-fast-model")).getByTestId(
                        "favorite-toggle",
                );

                await user.click(favoriteButton);

                expect(favoriteButton.getAttribute("aria-pressed")).toBe("true");

                await act(async () => {
                        toggleDeferred.resolve({ favoriteModels: ["fast-model"], isFavorite: true });
                        await toggleDeferred.promise;
                });
        });
});
