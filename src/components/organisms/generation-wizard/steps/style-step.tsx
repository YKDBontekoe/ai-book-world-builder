"use client";

import { writingStylePresets } from "@/lib/db/schema/generation";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { Badge } from "@/components/atoms/badge";
import { X } from "lucide-react";
import { useState } from "react";
import type { UseGenerationWizardReturn } from "../hooks/use-generation-wizard";
import { cn } from "@/lib/utils";

interface StyleStepProps {
	wizard: UseGenerationWizardReturn;
}

export function StyleStep({ wizard }: StyleStepProps) {
	const { state, updateStyle, updateMetadata } = wizard;
	const [inspirationInput, setInspirationInput] = useState("");

	const addInspiration = () => {
		if (
			inspirationInput.trim() &&
			!state.style.authorInspirations.includes(inspirationInput.trim())
		) {
			updateStyle({
				authorInspirations: [
					...state.style.authorInspirations,
					inspirationInput.trim(),
				],
			});
			setInspirationInput("");
		}
	};

	const removeInspiration = (author: string) => {
		updateStyle({
			authorInspirations: state.style.authorInspirations.filter(
				(a) => a !== author,
			),
		});
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Writing Style</h3>
				<p className="text-sm text-muted-foreground">
					Define the voice and style for your generated content.
				</p>
			</div>

			{/* Book metadata */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="bookTitle">Book Title</Label>
					<Input
						id="bookTitle"
						value={state.bookTitle}
						onChange={(e) => updateMetadata({ bookTitle: e.target.value })}
						placeholder="Enter book title"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="genre">Genre</Label>
					<Input
						id="genre"
						value={state.genre}
						onChange={(e) => updateMetadata({ genre: e.target.value })}
						placeholder="e.g., Fantasy, Sci-Fi, Mystery"
					/>
				</div>
			</div>

			{/* Style presets */}
			<div className="space-y-3">
				<Label>Style Preset</Label>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
					{writingStylePresets.map((preset) => (
						<button
							key={preset.id}
							type="button"
							onClick={() => updateStyle({ presetId: preset.id })}
							className={cn(
								"p-4 rounded-lg border text-left transition-all",
								state.style.presetId === preset.id
									? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
									: "border-border hover:border-primary/50",
							)}
						>
							<div className="font-medium">{preset.name}</div>
							<div className="text-xs text-muted-foreground mt-1">
								{preset.description}
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Custom description (shown when custom is selected) */}
			{state.style.presetId === "custom" && (
				<div className="space-y-2">
					<Label htmlFor="customStyle">Custom Style Description</Label>
					<Textarea
						id="customStyle"
						value={state.style.customDescription}
						onChange={(e) =>
							updateStyle({ customDescription: e.target.value })
						}
						placeholder="Describe your desired writing style... e.g., 'Spare, atmospheric prose with short sentences and powerful imagery. Focus on understated emotions and vivid sensory details.'"
						className="min-h-[100px]"
					/>
				</div>
			)}

			{/* Author inspirations */}
			<div className="space-y-2">
				<Label htmlFor="inspirations">Author Inspirations</Label>
				<p className="text-xs text-muted-foreground">
					Add authors whose style you'd like to emulate.
				</p>
				<div className="flex gap-2">
					<Input
						id="inspirations"
						value={inspirationInput}
						onChange={(e) => setInspirationInput(e.target.value)}
						placeholder="e.g., Brandon Sanderson"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addInspiration();
							}
						}}
					/>
					<Button type="button" variant="outline" onClick={addInspiration}>
						Add
					</Button>
				</div>
				{state.style.authorInspirations.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{state.style.authorInspirations.map((author) => (
							<Badge
								key={author}
								variant="secondary"
								className="pr-1"
							>
								{author}
								<button
									type="button"
									onClick={() => removeInspiration(author)}
									className="ml-1 hover:text-destructive"
								>
									<X className="w-3 h-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>

			{/* Target audience */}
			<div className="space-y-2">
				<Label htmlFor="audience">Target Audience</Label>
				<Input
					id="audience"
					value={state.style.targetAudience}
					onChange={(e) =>
						updateStyle({ targetAudience: e.target.value })
					}
					placeholder="e.g., Young Adult, Adult Fantasy Readers"
				/>
			</div>
		</div>
	);
}
