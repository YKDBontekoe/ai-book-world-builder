"use client";

import { Label } from "@/components/atoms/label";
import { Slider } from "@/components/atoms/slider";
import { Switch } from "@/components/atoms/switch";
import { WORDS_PER_PAGE } from "../constants";
import type { UseGenerationWizardReturn } from "../hooks/use-generation-wizard";

interface StructureStepProps {
	wizard: UseGenerationWizardReturn;
}

export function StructureStep({ wizard }: StructureStepProps) {
	const { state, updateStructure } = wizard;

	const estimatedWordCount =
		state.structure.totalChapters *
		state.structure.pagesPerChapter *
		WORDS_PER_PAGE;

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Book Structure</h3>
				<p className="text-sm text-muted-foreground">
					Configure the structure of your book.
				</p>
			</div>

			{/* Chapters */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label htmlFor="totalChapters">Total Chapters</Label>
					<span className="text-sm font-medium tabular-nums">
						{state.structure.totalChapters}
					</span>
				</div>
				<Slider
					id="totalChapters"
					min={3}
					max={50}
					step={1}
					value={[state.structure.totalChapters]}
					onValueChange={([value]) =>
						updateStructure({ totalChapters: value })
					}
				/>
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>Short (3)</span>
					<span>Novel (20-30)</span>
					<span>Epic (50)</span>
				</div>
			</div>

			{/* Pages per chapter */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label htmlFor="pagesPerChapter">Pages per Chapter</Label>
					<span className="text-sm font-medium tabular-nums">
						{state.structure.pagesPerChapter}
					</span>
				</div>
				<Slider
					id="pagesPerChapter"
					min={5}
					max={40}
					step={1}
					value={[state.structure.pagesPerChapter]}
					onValueChange={([value]) =>
						updateStructure({ pagesPerChapter: value })
					}
				/>
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>Short (5)</span>
					<span>Standard (15-20)</span>
					<span>Long (40)</span>
				</div>
			</div>

			{/* Estimated word count */}
			<div className="p-4 rounded-lg bg-muted/50 border">
				<div className="text-sm text-muted-foreground">
					Estimated Word Count
				</div>
				<div className="text-2xl font-bold mt-1">
					{estimatedWordCount.toLocaleString()} words
				</div>
				<div className="text-xs text-muted-foreground mt-1">
					Based on ~{WORDS_PER_PAGE} words per page
				</div>
			</div>

			{/* Additional sections */}
			<div className="space-y-4">
				<Label>Additional Sections</Label>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div>
							<div className="font-medium text-sm">Prologue</div>
							<div className="text-xs text-muted-foreground">
								Add an opening prologue to set the stage
							</div>
						</div>
						<Switch
							checked={state.structure.includePrologue}
							onCheckedChange={(checked) =>
								updateStructure({ includePrologue: checked })
							}
							aria-label="Include prologue"
						/>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<div className="font-medium text-sm">Epilogue</div>
							<div className="text-xs text-muted-foreground">
								Add a closing epilogue to wrap up the story
							</div>
						</div>
						<Switch
							checked={state.structure.includeEpilogue}
							onCheckedChange={(checked) =>
								updateStructure({ includeEpilogue: checked })
							}
							aria-label="Include epilogue"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
