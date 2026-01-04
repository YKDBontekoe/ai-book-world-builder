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

const THEME_COLORS: Record<string, string> = {
	violet: "262 80% 60%",
	blue: "217 91% 60%",
	emerald: "142 76% 36%",
	amber: "38 92% 50%",
	rose: "340 75% 55%",
	slate: "215 16% 47%",
};

export function AppearanceProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = useQueryClient();

	const { data: result, isLoading } = useQuery({
		queryKey: ["appearance-preferences"],
		queryFn: async () => {
			const res = await getAppearancePreferences();
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		staleTime: Infinity,
	});

	const preferences = result;

	const mutation = useMutation({
		mutationFn: async (updates: Partial<AppearancePreferences>) => {
			const res = await saveAppearancePreferences(updates);
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
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
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["appearance-preferences"] });
		},
	});

	const updatePreferences = React.useCallback(
		async (updates: Partial<AppearancePreferences>) => {
			await mutation.mutateAsync(updates);
		},
		[mutation],
	);

	// Apply Theme Side Effect
	React.useEffect(() => {
		if (preferences?.theme) {
			const root = document.documentElement;
			const hsl = THEME_COLORS[preferences.theme] || THEME_COLORS.violet;

			root.style.setProperty("--primary", hsl);
			root.style.setProperty("--sidebar-primary", hsl);
		}
	}, [preferences?.theme]);

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
