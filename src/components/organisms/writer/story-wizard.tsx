"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	Loader2,
	Plus,
	RefreshCw,
	Sparkles,
	Trash2,
	Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	type BookPlan,
	createBookFromPlan,
	generateBookPlan,
	type StoryStyle,
} from "@/app/actions/story-generation";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { ScrollArea } from "@/components/atoms/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Textarea } from "@/components/atoms/textarea";

interface StoryWizardProps {
	projectId: string;
	onComplete: () => void;
}

const DEFAULT_STYLE: StoryStyle = {
	genre: "General Fiction",
	pov: "Third Person",
	tone: "Neutral",
};

export function StoryWizard({ projectId, onComplete }: StoryWizardProps) {
	const [step, setStep] = useState<
		"input" | "generating" | "review" | "creating"
	>("input");
	const [prompt, setPrompt] = useState("");
	const [style, setStyle] = useState<StoryStyle>(DEFAULT_STYLE);
	const [plan, setPlan] = useState<BookPlan | null>(null);

	const handleGeneratePlan = async () => {
		if (!prompt.trim()) return;

		setStep("generating");
		try {
			const result = await generateBookPlan(prompt, style);
			if (result.success && result.plan) {
				setPlan(result.plan);
				setStep("review");
			} else {
				toast.error("Failed to generate plan. Please try again.");
				setStep("input");
			}
		} catch (_error) {
			toast.error("An error occurred.");
			setStep("input");
		}
	};

	const handleCreateStory = async () => {
		if (!plan) return;

		setStep("creating");
		const toastId = toast.loading("Building your story structure...");

		try {
			const result = await createBookFromPlan(projectId, plan, style);
			if (result.success) {
				toast.success("Story structure created!", { id: toastId });
				// Trigger a reload or update
				onComplete();
			} else {
				toast.error("Failed to save story.", { id: toastId });
				setStep("review");
			}
		} catch (_error) {
			toast.error("An error occurred.", { id: toastId });
			setStep("review");
		}
	};

	const updatePlan = (field: keyof BookPlan, value: string) => {
		if (!plan) return;
		setPlan({ ...plan, [field]: value });
	};

	const updateChapter = (
		index: number,
		field: "title" | "summary",
		value: string,
	) => {
		if (!plan) return;
		const newChapters = [...plan.chapters];
		newChapters[index] = { ...newChapters[index], [field]: value };
		setPlan({ ...plan, chapters: newChapters });
	};

	const deleteChapter = (index: number) => {
		if (!plan) return;
		const newChapters = plan.chapters.filter((_, i) => i !== index);
		setPlan({ ...plan, chapters: newChapters });
	};

	const addChapter = () => {
		if (!plan) return;
		setPlan({
			...plan,
			chapters: [
				...plan.chapters,
				{ title: "New Chapter", summary: "Describe what happens..." },
			],
		});
	};

	return (
		<div className="flex flex-col items-center justify-start md:justify-center min-h-full w-full max-w-4xl mx-auto p-4 md:p-6 pb-32">
			<AnimatePresence mode="wait">
				{step === "input" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="w-full max-w-2xl space-y-6 pt-4 md:pt-0"
						key="input"
					>
						<div className="text-center space-y-2">
							<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
								<Wand2 className="w-6 h-6 text-primary" />
							</div>
							<h2 className="text-2xl font-bold tracking-tight">
								Generate Your Story
							</h2>
							<p className="text-muted-foreground">
								Describe your book idea and we'll build the structure for you.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label>Genre</Label>
								<Select
									value={style.genre}
									onValueChange={(v) => setStyle({ ...style, genre: v })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Fantasy">Fantasy</SelectItem>
										<SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
										<SelectItem value="Mystery">Mystery</SelectItem>
										<SelectItem value="Thriller">Thriller</SelectItem>
										<SelectItem value="Romance">Romance</SelectItem>
										<SelectItem value="General Fiction">
											General Fiction
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>POV</Label>
								<Select
									value={style.pov}
									onValueChange={(v) => setStyle({ ...style, pov: v })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="First Person">First Person</SelectItem>
										<SelectItem value="Third Person Limited">
											Third Person Limited
										</SelectItem>
										<SelectItem value="Third Person Omniscient">
											Third Person Omniscient
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Tone</Label>
								<Select
									value={style.tone}
									onValueChange={(v) => setStyle({ ...style, tone: v })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Neutral">Neutral</SelectItem>
										<SelectItem value="Dark">Dark</SelectItem>
										<SelectItem value="Humorous">Humorous</SelectItem>
										<SelectItem value="Epic">Epic</SelectItem>
										<SelectItem value="Intimate">Intimate</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="relative">
							<Textarea
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								placeholder="e.g. A cyberpunk detective story set on Mars where water is more valuable than gold..."
								className="min-h-[160px] text-lg p-4 resize-none glass-input"
								autoFocus
							/>
							<Button
								className="absolute bottom-4 right-4"
								onClick={handleGeneratePlan}
								disabled={!prompt.trim()}
							>
								<Sparkles className="w-4 h-4 mr-2" />
								Generate Plan
							</Button>
						</div>
					</motion.div>
				)}

				{step === "generating" && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.05 }}
						className="flex flex-col items-center justify-center space-y-4"
						key="generating"
					>
						<Loader2 className="w-12 h-12 animate-spin text-primary" />
						<p className="text-lg font-medium animate-pulse">
							Designing your story structure...
						</p>
					</motion.div>
				)}

				{step === "review" && plan && (
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
									onChange={(e) => updatePlan("title", e.target.value)}
									className="text-2xl font-bold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
									placeholder="Story Title"
								/>
								<Input
									value={plan.logline}
									onChange={(e) => updatePlan("logline", e.target.value)}
									className="text-muted-foreground bg-transparent border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
									placeholder="Logline"
								/>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" onClick={() => setStep("input")}>
									<RefreshCw className="w-4 h-4 mr-2" />
									Restart
								</Button>
								<Button onClick={handleCreateStory}>
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
											onChange={(e) => updatePlan("summary", e.target.value)}
											className="min-h-[100px] resize-none glass-input"
										/>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Chapter Outline
											</Label>
											<Button size="sm" variant="ghost" onClick={addChapter}>
												<Plus className="w-4 h-4 mr-2" />
												Add Chapter
											</Button>
										</div>

										<div className="space-y-4">
											{plan.chapters.map((chapter, i) => (
												<div
													key={i}
													className="p-4 rounded-lg bg-muted/30 border border-border/50 group relative hover:border-primary/20 transition-colors"
												>
													<Button
														variant="ghost"
														size="icon"
														className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
														onClick={() => deleteChapter(i)}
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
																updateChapter(i, "title", e.target.value)
															}
															className="font-semibold h-9 bg-transparent border-transparent hover:border-border focus:border-input transition-colors"
															placeholder="Chapter Title"
														/>
													</div>
													<Textarea
														value={chapter.summary}
														onChange={(e) =>
															updateChapter(i, "summary", e.target.value)
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
				)}
			</AnimatePresence>
		</div>
	);
}
