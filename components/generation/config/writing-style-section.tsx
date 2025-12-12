"use client";

import { Palette } from "lucide-react";
import { useId } from "react";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TipCard } from "@/components/ui/tip-card";
import { type GenerationSettings, writingStylePresets } from "@/lib/db/schema";

import type { SettingsChangeHandler } from "./constants";

interface WritingStyleSectionProps {
	settings: Partial<GenerationSettings>;
	onSettingChange: SettingsChangeHandler;
	tip?: string;
}

export function WritingStyleSection({
	settings,
	onSettingChange,
	tip,
}: WritingStyleSectionProps) {
	const presetId = useId();
	const customStyleId = useId();
	const inspirationsId = useId();

	return (
		<CollapsibleSection
			title="Writing Style"
			icon={<Palette className="h-5 w-5" />}
			accentColor="pink"
			defaultOpen
		>
			<div className="space-y-2">
				<Label htmlFor={presetId}>Style Preset</Label>
				<Select
					value={settings.writingStylePreset}
					onValueChange={(v) =>
						onSettingChange(
							"writingStylePreset",
							v as GenerationSettings["writingStylePreset"],
						)
					}
				>
					<SelectTrigger
						id={presetId}
						aria-label="Style Preset"
						className="h-12 rounded-xl border-border/50 bg-background/50"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{writingStylePresets.map((preset) => (
							<SelectItem key={preset.id} value={preset.id} className="py-3">
								<div className="flex flex-col">
									<span className="font-medium">{preset.name}</span>
									<span className="text-xs text-muted-foreground">
										{preset.description}
									</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{settings.writingStylePreset === "custom" ? (
				<>
					{tip ? <TipCard>{tip}</TipCard> : null}
					<div className="space-y-2">
						<Label htmlFor={customStyleId}>Custom Style Description</Label>
						<Textarea
							id={customStyleId}
							placeholder="Describe the writing style you want..."
							value={settings.customStyleDescription ?? ""}
							onChange={(e) =>
								onSettingChange("customStyleDescription", e.target.value)
							}
							rows={4}
							className="resize-none rounded-xl border-border/50 bg-background/50"
						/>
					</div>
				</>
			) : null}

			<div className="space-y-2">
				<Label htmlFor={inspirationsId}>Author Inspirations</Label>
				<Textarea
					id={inspirationsId}
					placeholder="e.g., Brandon Sanderson, Patrick Rothfuss..."
					value={settings.authorInspirations?.join(", ") ?? ""}
					onChange={(e) =>
						onSettingChange(
							"authorInspirations",
							e.target.value.split(",").map((s) => s.trim()),
						)
					}
					rows={2}
					className="rounded-xl border-border/50 bg-background/50"
				/>
			</div>
		</CollapsibleSection>
	);
}
