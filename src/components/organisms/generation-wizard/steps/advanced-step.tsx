"use client";

import { Label } from "@/components/atoms/label";
import { Slider } from "@/components/atoms/slider";
import { Switch } from "@/components/atoms/switch";
import { AlertCircle } from "lucide-react";
import type { UseGenerationWizardReturn } from "../hooks/use-generation-wizard";

interface AdvancedStepProps {
	wizard: UseGenerationWizardReturn;
}

export function AdvancedStep({ wizard }: AdvancedStepProps) {
	const { state, updateAdvanced } = wizard;

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Advanced Options</h3>
				<p className="text-sm text-muted-foreground">
					Fine-tune quality settings and additional outputs.
				</p>
			</div>

			{/* Quality Settings */}
			<div className="space-y-4">
				<Label className="text-sm font-medium">Quality Settings</Label>

				{/* Revision rounds */}
				<div className="space-y-4 p-4 rounded-lg border bg-muted/20">
					<div className="flex items-center justify-between">
						<div>
							<div className="font-medium text-sm">Revision Rounds</div>
							<div className="text-xs text-muted-foreground">
								Each chapter will be reviewed and revised this many
								times
							</div>
						</div>
						<span className="text-lg font-bold tabular-nums">
							{state.advanced.revisionRounds}
						</span>
					</div>
					<Slider
						min={0}
						max={3}
						step={1}
						value={[state.advanced.revisionRounds]}
						onValueChange={([value]) =>
							updateAdvanced({ revisionRounds: value })
						}
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>None (Faster)</span>
						<span>3 (Best Quality)</span>
					</div>
				</div>

				{/* Consistency check */}
				<div className="flex items-center justify-between p-4 rounded-lg border">
					<div className="flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
						<div>
							<div className="font-medium text-sm">
								Consistency Check
							</div>
							<div className="text-xs text-muted-foreground">
								Analyze the full book for plot holes and
								inconsistencies
							</div>
						</div>
					</div>
					<Switch
						checked={state.advanced.runConsistencyCheck}
						onCheckedChange={(checked) =>
							updateAdvanced({ runConsistencyCheck: checked })
						}
					/>
				</div>
			</div>

			{/* Additional Outputs */}
			<div className="space-y-4">
				<Label className="text-sm font-medium">Additional Outputs</Label>

				<div className="grid gap-3">
					<div className="flex items-center justify-between p-4 rounded-lg border">
						<div>
							<div className="font-medium text-sm">
								Back Cover Blurb
							</div>
							<div className="text-xs text-muted-foreground">
								Generate a marketing-ready book description
							</div>
						</div>
						<Switch
							checked={state.advanced.generateBackCoverBlurb}
							onCheckedChange={(checked) =>
								updateAdvanced({ generateBackCoverBlurb: checked })
							}
						/>
					</div>

					<div className="flex items-center justify-between p-4 rounded-lg border">
						<div>
							<div className="font-medium text-sm">
								Chapter Summaries
							</div>
							<div className="text-xs text-muted-foreground">
								Generate a summary for each chapter
							</div>
						</div>
						<Switch
							checked={state.advanced.generateChapterSummaries}
							onCheckedChange={(checked) =>
								updateAdvanced({ generateChapterSummaries: checked })
							}
						/>
					</div>

					<div className="flex items-center justify-between p-4 rounded-lg border">
						<div>
							<div className="font-medium text-sm">
								Table of Contents
							</div>
							<div className="text-xs text-muted-foreground">
								Generate a formatted table of contents
							</div>
						</div>
						<Switch
							checked={state.advanced.generateTableOfContents}
							onCheckedChange={(checked) =>
								updateAdvanced({
									generateTableOfContents: checked,
								})
							}
						/>
					</div>

					<div className="flex items-center justify-between p-4 rounded-lg border opacity-60">
						<div>
							<div className="font-medium text-sm">
								Front Cover Image
							</div>
							<div className="text-xs text-muted-foreground">
								Generate a cover image concept (Coming Soon)
							</div>
						</div>
						<Switch
							checked={state.advanced.generateFrontCover}
							onCheckedChange={(checked) =>
								updateAdvanced({ generateFrontCover: checked })
							}
							disabled
						/>
					</div>

					<div className="flex items-center justify-between p-4 rounded-lg border opacity-60">
						<div>
							<div className="font-medium text-sm">
								Character Sheets
							</div>
							<div className="text-xs text-muted-foreground">
								Generate detailed character descriptions (Coming Soon)
							</div>
						</div>
						<Switch
							checked={state.advanced.generateCharacterSheets}
							onCheckedChange={(checked) =>
								updateAdvanced({ generateCharacterSheets: checked })
							}
							disabled
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
