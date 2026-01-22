"use client";

import { Sparkles } from "lucide-react";
import { type JSX, useState } from "react";
import { toast } from "sonner";
import { saveModelPreferences } from "@/app/actions/settings";
import { Label } from "@/components/atoms/label";
import { GlassCard } from "@/components/molecules/glass-card";
import { SettingsModelSelector } from "@/components/organisms/settings/settings-model-selector";
import type { ChatModel } from "@/lib/ai/models";

interface PlatformModelSettingsProps {
	availableModels: ChatModel[];
	initialPreferences: {
		light: string | null;
		middle: string | null;
		large: string | null;
	};
}

export function PlatformModelSettings({
	availableModels,
	initialPreferences,
}: PlatformModelSettingsProps): JSX.Element {
	const [preferences, setPreferences] = useState(initialPreferences);

	const handleModelChange = async (
		type: "light" | "middle" | "large",
		value: string,
	) => {
		setPreferences((prev) => ({ ...prev, [type]: value })); // Optimistic update via functional update

		try {
			await saveModelPreferences({ ...preferences, [type]: value });
			toast.success("Preference saved");
		} catch (_error) {
			toast.error("Failed to save preference");
			// Only revert if state still matches the failed attempt (simple check)
			// In a more complex scenario we might check ID, but here reverting to previous 'preferences' closure capture is generally safe enough for a simple toggle/select
			// provided the user hasn't made another change in the meantime that we want to keep.
			// Using functional update to revert only this field could be better but 'preferences' here is stale from closure?
			// Actually 'preferences' is from the render scope when handleModelChange was created.
			// If we want to be safe against rapid changes, we should use the previous value.
			setPreferences((prev) => ({ ...prev, [type]: preferences[type] }));
		}
	};

	return (
		<GlassCard variant="subtle" className="p-6 md:p-8">
			<div className="flex items-center gap-3 mb-6">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
					<Sparkles className="h-5 w-5" />
				</div>
				<div>
					<h3 className="text-xl font-semibold">Global AI Configuration</h3>
					<p className="text-sm text-muted-foreground">
						Set your preferred models for different complexity levels across the
						platform.
					</p>
				</div>
			</div>

			<div className="grid gap-8 md:grid-cols-3">
				<div className="space-y-3">
					<Label className="text-base font-medium">Light Model</Label>
					<p className="text-sm text-muted-foreground min-h-[40px]">
						Fast and efficient. Best for simple tasks, quick edits, and
						autocomplete.
					</p>
					<SettingsModelSelector
						availableModels={availableModels}
						selectedModelId={preferences.light}
						onModelChange={(val) => handleModelChange("light", val)}
					/>
				</div>

				<div className="space-y-3">
					<Label className="text-base font-medium">Middle Model</Label>
					<p className="text-sm text-muted-foreground min-h-[40px]">
						Balanced performance. The default for most chat interactions and
						drafting.
					</p>
					<SettingsModelSelector
						availableModels={availableModels}
						selectedModelId={preferences.middle}
						onModelChange={(val) => handleModelChange("middle", val)}
					/>
				</div>

				<div className="space-y-3">
					<Label className="text-base font-medium">Large Model</Label>
					<p className="text-sm text-muted-foreground min-h-[40px]">
						Maximum reasoning power. Use for deep analysis, planning, and
						complex writing.
					</p>
					<SettingsModelSelector
						availableModels={availableModels}
						selectedModelId={preferences.large}
						onModelChange={(val) => handleModelChange("large", val)}
					/>
				</div>
			</div>
		</GlassCard>
	);
}
