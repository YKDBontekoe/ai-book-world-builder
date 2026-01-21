"use client";

import { motion } from "framer-motion";
import { Check, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { Textarea } from "@/components/atoms/textarea";
import type { BookPlan } from "@/lib/services/schemas/story-schemas";

interface WizardReviewStepProps {
	plan: BookPlan;
	onUpdatePlan: (field: keyof BookPlan, value: string) => void;
	onUpdateChapter: (
		index: number,
		field: "title" | "summary",
		value: string,
	) => void;
	onDeleteChapter: (index: number) => void;
	onAddChapter: () => void;
	onRestart: () => void;
	onCreateStory: () => void;
}

export function WizardReviewStep({
	plan,
	onUpdatePlan,
	onUpdateChapter,
	onDeleteChapter,
	onAddChapter,
	onRestart,
	onCreateStory,
}: WizardReviewStepProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="w-full flex flex-col h-[80vh]"
			key="review"
		>
			<div className="mb-6 flex items-center justify-between shrink-0">
				<div className="space-y-1">
					<Input
						value={plan.title}
						onChange={(e) => onUpdatePlan("title", e.target.value)}
						className="text-2xl font-bold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
						placeholder="Story Title"
					/>
					<Input
						value={plan.logline}
						onChange={(e) => onUpdatePlan("logline", e.target.value)}
						className="text-muted-foreground bg-transparent border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
						placeholder="Logline (One-sentence summary)"
					/>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={onRestart}>
						<RefreshCw className="w-4 h-4 mr-2" />
						Restart
					</Button>
					<Button onClick={onCreateStory}>
						<Check className="w-4 h-4 mr-2" />
						Create Story
					</Button>
				</div>
			</div>

			<Card className="flex-1 overflow-hidden glass-card flex flex-col">
				<ScrollArea className="flex-1 p-6">
					<div className="space-y-8 max-w-3xl mx-auto">
						<div className="space-y-2">
							<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Summary
							</Label>
							<Textarea
								value={plan.summary}
								onChange={(e) => onUpdatePlan("summary", e.target.value)}
								className="min-h-[100px] resize-none glass-input"
							/>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Chapter Outline
								</Label>
								<Button size="sm" variant="ghost" onClick={onAddChapter}>
									<Plus className="w-4 h-4 mr-2" />
									Add Chapter
								</Button>
							</div>

							<div className="space-y-4">
								{plan.chapters.map((chapter, i) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: Order is stable during editing
										key={i}
										className="p-4 rounded-lg bg-muted/30 border border-border/50 group relative hover:border-primary/20 transition-colors"
									>
										<Button
											variant="ghost"
											size="icon"
											className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
											onClick={() => onDeleteChapter(i)}
										>
											<Trash2 className="w-4 h-4" />
										</Button>

										<div className="flex items-center gap-3 mb-3 pr-8">
											<span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
												CH {i + 1}
											</span>
											<Input
												value={chapter.title}
												onChange={(e) =>
													onUpdateChapter(i, "title", e.target.value)
												}
												className="font-semibold h-9 bg-transparent border-transparent hover:border-border focus:border-input transition-colors"
												placeholder="Chapter Title"
											/>
										</div>
										<Textarea
											value={chapter.summary}
											onChange={(e) =>
												onUpdateChapter(i, "summary", e.target.value)
											}
											className="text-sm text-muted-foreground min-h-[80px] bg-transparent border-transparent hover:border-border focus:border-input resize-none transition-colors"
											placeholder="Chapter Summary"
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</ScrollArea>
			</Card>
		</motion.div>
	);
}
