"use client";

import { Sparkles } from "lucide-react";
import { type JSX, useState } from "react";
import { toast } from "sonner";
import { saveModelPreferences } from "@/app/actions/settings";
import { Label } from "@/components/atoms/label";
import { GlassCard } from "@/components/molecules/glass-card";
import { ModelDetails } from "@/components/molecules/model-details";
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

interface ModelSectionProps {
	label: string;
	description: string;
	type: "light" | "middle" | "large";
	selectedModelId: string | null;
	availableModels: ChatModel[];
	onModelChange: (type: "light" | "middle" | "large", value: string) => void;
	getModel: (id: string | null) => ChatModel | undefined;
}

function ModelSection({
	label,
	description,
	type,
	selectedModelId,
	availableModels,
	onModelChange,
	getModel,
}: ModelSectionProps) {
	return (
		<div className="space-y-3 flex flex-col">
			<div className="space-y-3">
				<Label className="text-base font-medium">{label}</Label>
				<p className="text-sm text-muted-foreground min-h-[40px]">
					{description}
				</p>
				<SettingsModelSelector
					availableModels={availableModels}
					selectedModelId={selectedModelId}
					onModelChange={(val) => onModelChange(type, val)}
				/>
			</div>
			<ModelDetails model={getModel(selectedModelId)} className="flex-1" />
		</div>
	);
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
			setPreferences((prev) => ({ ...prev, [type]: preferences[type] }));
		}
	};

	const getModel = (id: string | null) =>
		availableModels.find((m) => m.id === id);

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
				<ModelSection
					label="Light Model"
					description="Fast and efficient. Best for simple tasks, quick edits, and autocomplete."
					type="light"
					selectedModelId={preferences.light}
					availableModels={availableModels}
					onModelChange={handleModelChange}
					getModel={getModel}
				/>

				<ModelSection
					label="Middle Model"
					description="Balanced performance. The default for most chat interactions and drafting."
					type="middle"
					selectedModelId={preferences.middle}
					availableModels={availableModels}
					onModelChange={handleModelChange}
					getModel={getModel}
				/>

				<ModelSection
					label="Large Model"
					description="Maximum reasoning power. Use for deep analysis, planning, and complex writing."
					type="large"
					selectedModelId={preferences.large}
					availableModels={availableModels}
					onModelChange={handleModelChange}
					getModel={getModel}
				/>
			</div>
		</GlassCard>
	);
}
