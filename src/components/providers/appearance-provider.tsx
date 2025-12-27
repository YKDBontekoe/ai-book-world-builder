"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
	getAppearancePreferences,
	saveAppearancePreferences,
} from "@/app/actions/appearance";
import type { AppearancePreferences } from "@/lib/db/schema/auth";

interface AppearanceContextType extends AppearancePreferences {
	updatePreferences: (updates: Partial<AppearancePreferences>) => Promise<void>;
	isLoading: boolean;
}

const AppearanceContext = React.createContext<
	AppearanceContextType | undefined
>(undefined);

export function AppearanceProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = useQueryClient();

	const { data: preferences, isLoading } = useQuery({
		queryKey: ["appearance-preferences"],
		queryFn: () => getAppearancePreferences(),
		staleTime: Infinity, // Fetch once per session ideally, or user refresh
	});

	const mutation = useMutation({
		mutationFn: saveAppearancePreferences,
		onMutate: async (newPrefs) => {
			await queryClient.cancelQueries({ queryKey: ["appearance-preferences"] });
			const previousPrefs = queryClient.getQueryData<AppearancePreferences>([
				"appearance-preferences",
			]);

			// Optimistic update
			if (previousPrefs) {
				queryClient.setQueryData<AppearancePreferences>(
					["appearance-preferences"],
					{
						...previousPrefs,
						...newPrefs,
					},
				);
			}

			return { previousPrefs };
		},
		onError: (_err, _newPrefs, context) => {
			if (context?.previousPrefs) {
				queryClient.setQueryData(
					["appearance-preferences"],
					context.previousPrefs,
				);
			}
			toast.error("Failed to save appearance settings");
		},
		onSuccess: () => {
			toast.success("Appearance settings saved");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["appearance-preferences"] });
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: mutation is stable
	const updatePreferences = React.useCallback(
		async (updates: Partial<AppearancePreferences>) => {
			await mutation.mutateAsync(updates);
		},
		[],
	);

	// Apply Theme and Font Side Effects
	React.useEffect(() => {
		if (preferences) {
			const root = document.documentElement;
			root.setAttribute("data-theme", preferences.theme);
			root.setAttribute("data-editor-font", preferences.editorFont);
		}
	}, [preferences]);

	const value = React.useMemo(() => {
		return {
			theme: preferences?.theme || "violet",
			editorFont: preferences?.editorFont || "sans",
			editorFontSize: preferences?.editorFontSize || 16,
			editorLineHeight: preferences?.editorLineHeight || 1.6,
			updatePreferences,
			isLoading,
		};
	}, [preferences, isLoading, updatePreferences]);

	return (
		<AppearanceContext.Provider value={value}>
			{children}
		</AppearanceContext.Provider>
	);
}

export function useAppearance() {
	const context = React.useContext(AppearanceContext);
	if (context === undefined) {
		throw new Error("useAppearance must be used within an AppearanceProvider");
	}
	return context;
}
