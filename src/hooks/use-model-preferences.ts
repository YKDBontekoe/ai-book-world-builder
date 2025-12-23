import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
        getModelPreferences,
        toggleFavoriteModelAction,
        trackRecentModel,
        updateFavoriteModelsAction,
} from "@/app/actions/model-preferences";
import type { ModelPreferences } from "@/lib/db/schema/auth";

export type ModelPreferencesState = {
        favoriteModels: string[];
        recentModels: string[];
        modelPreferences: ModelPreferences;
};

export type UseModelPreferencesOptions = {
        /** Maximum number of recent models to keep in memory. */
        maxRecent?: number;
};

export type UseModelPreferencesReturn = ModelPreferencesState & {
        /** Indicates whether preferences are being loaded from the server. */
        isLoading: boolean;
        /** Indicates whether a server action is currently pending. */
        isUpdating: boolean;
        /** Captures the latest recoverable error. */
        error: string | null;
        /** Optimistically toggle a favorite model and persist the change. */
        toggleFavorite: (modelId: string) => void;
        /** Update the order of favorite models. */
        moveFavorite: (modelId: string, direction: "up" | "down") => void;
        /** Track a model as recently used while updating local state. */
        recordRecentModel: (modelId: string) => void;
};

const DEFAULT_PREFERENCES: ModelPreferencesState = {
        favoriteModels: [],
        recentModels: [],
        modelPreferences: { light: null, middle: null, large: null },
};

/**
 * Manage persisted model preferences with optimistic updates for favorites and recents.
 */
export function useModelPreferences(
        options: UseModelPreferencesOptions = {},
): UseModelPreferencesReturn {
        const { maxRecent = 5 } = options;
        const [preferences, setPreferences] = useState<ModelPreferencesState>(
                DEFAULT_PREFERENCES,
        );
        const [error, setError] = useState<string | null>(null);
        const [isLoading, setIsLoading] = useState(true);
        const [isUpdating, startTransition] = useTransition();

        useEffect(() => {
                let isActive = true;

                async function loadPreferences() {
                        setIsLoading(true);
                        try {
                                const prefs = await getModelPreferences();
                                if (isActive) {
                                        setPreferences(prefs);
                                        setError(null);
                                }
                        } catch (err) {
                                if (isActive) {
                                        setPreferences(DEFAULT_PREFERENCES);
                                        setError(
                                                err instanceof Error
                                                        ? err.message
                                                        : "Unable to load model preferences.",
                                        );
                                }
                        } finally {
                                if (isActive) {
                                        setIsLoading(false);
                                }
                        }
                }

                loadPreferences();

                return () => {
                        isActive = false;
                };
        }, []);

        const toggleFavorite = useCallback(
                (modelId: string) => {
                        setError(null);
                        const previousFavorites = preferences.favoriteModels;
                        const isFavorite = previousFavorites.includes(modelId);
                        const updatedFavorites = isFavorite
                                ? previousFavorites.filter((id) => id !== modelId)
                                : [...previousFavorites, modelId];

                        setPreferences((prev) => ({ ...prev, favoriteModels: updatedFavorites }));

                        startTransition(async () => {
                                try {
                                        const result = await toggleFavoriteModelAction(modelId);
                                        setPreferences((current) => ({
                                                ...current,
                                                favoriteModels: result.favoriteModels,
                                        }));
                                } catch (err) {
                                        setError(
                                                err instanceof Error
                                                        ? err.message
                                                        : "Unable to update favorites.",
                                        );
                                        setPreferences((current) => ({
                                                ...current,
                                                favoriteModels: previousFavorites,
                                        }));
                                }
                        });
                },
                [preferences.favoriteModels],
        );

        const moveFavorite = useCallback(
                (modelId: string, direction: "up" | "down") => {
                        const currentIndex = preferences.favoriteModels.indexOf(modelId);
                        if (currentIndex === -1) {
                                return;
                        }

                        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
                        if (targetIndex < 0 || targetIndex >= preferences.favoriteModels.length) {
                                return;
                        }

                        const updatedFavorites = [...preferences.favoriteModels];
                        [updatedFavorites[currentIndex], updatedFavorites[targetIndex]] = [
                                updatedFavorites[targetIndex],
                                updatedFavorites[currentIndex],
                        ];

                        setPreferences((prev) => ({ ...prev, favoriteModels: updatedFavorites }));

                        startTransition(async () => {
                                try {
                                        await updateFavoriteModelsAction(updatedFavorites);
                                        setError(null);
                                } catch (err) {
                                        setError(
                                                err instanceof Error
                                                        ? err.message
                                                        : "Unable to reorder favorites.",
                                        );
                                        setPreferences((current) => ({
                                                ...current,
                                                favoriteModels: preferences.favoriteModels,
                                        }));
                                }
                        });
                },
                [preferences.favoriteModels],
        );

        const recordRecentModel = useCallback(
                (modelId: string) => {
                        const filteredRecent = preferences.recentModels.filter((id) => id !== modelId);
                        const updatedRecents = [modelId, ...filteredRecent].slice(0, maxRecent);

                        setPreferences((prev) => ({ ...prev, recentModels: updatedRecents }));

                        startTransition(async () => {
                                try {
                                        await trackRecentModel(modelId);
                                        setError(null);
                                } catch (err) {
                                        setError(
                                                err instanceof Error
                                                        ? err.message
                                                        : "Unable to track recent models.",
                                        );
                                }
                        });
                },
                [maxRecent, preferences.recentModels],
        );

        return useMemo(
                () => ({
                        favoriteModels: preferences.favoriteModels,
                        recentModels: preferences.recentModels,
                        modelPreferences: preferences.modelPreferences,
                        isLoading,
                        isUpdating,
                        error,
                        toggleFavorite,
                        moveFavorite,
                        recordRecentModel,
                }),
                [preferences, isLoading, isUpdating, error, toggleFavorite, moveFavorite, recordRecentModel],
        );
}
