"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	BookOpenIcon,
	CheckCircle2,
	Loader2,
	SparklesIcon,
	Wand2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createBookFromPlan, generateBookPlan } from "@/app/actions/story-generation";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { Switch } from "@/components/atoms/switch";
import { Textarea } from "@/components/atoms/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import type { BookPlan } from "@/lib/services/story-service";
import { cn } from "@/lib/utils";

type PromptPreset = {
	label: string;
	prompt: string;
	genre: string;
	tone: string;
};

const PROMPT_PRESETS: PromptPreset[] = [
	{
		label: "Starbound Heist",
		prompt:
			"A disgraced navigator and her outlaw crew plot a heist across a sentient space station that reconfigures itself every hour.",
		genre: "sci-fi",
		tone: "gritty",
	},
	{
		label: "Forest Crown",
		prompt:
			"A reluctant heir must broker peace between rival forest spirits before the first frost freezes the kingdom forever.",
		genre: "fantasy",
		tone: "whimsical",
	},
	{
		label: "Velvet Alibi",
		prompt:
			"A jazz singer with a hidden past uncovers a conspiracy when her club becomes the last stop for missing patrons.",
		genre: "mystery",
		tone: "dark",
	},
	{
		label: "Runaway Romance",
		prompt:
			"Two rival chefs on a cross-country food truck tour fall for each other while chasing the ultimate recipe.",
		genre: "romance",
		tone: "humorous",
	},
];

const GENRE_LABELS: Record<string, string> = {
	"sci-fi": "Sci-Fi",
	fantasy: "Fantasy",
	mystery: "Mystery",
	romance: "Romance",
	thriller: "Thriller",
	horror: "Horror",
	historical: "Historical",
};

const TONE_LABELS: Record<string, string> = {
	dark: "Dark",
	humorous: "Humorous",
	serious: "Serious",
	whimsical: "Whimsical",
	gritty: "Gritty",
};

export function GeneratorPane(): JSX.Element {
	const { projectId } = useBookCanvasLayout();
	const queryClient = useQueryClient();

	const [prompt, setPrompt] = useState("");
	const [genre, setGenre] = useState("");
	const [tone, setTone] = useState("");
	const [autoApply, setAutoApply] = useState(true);
	const [generatedPlan, setGeneratedPlan] = useState<BookPlan | null>(null);

	const { mutate: generate, isPending: isGenerating } = useMutation({
		mutationFn: async () => {
			if (!prompt) throw new Error("Prompt is empty");
			const res = await generateBookPlan(
				prompt,
				{ genre, tone, pov: "Third Person" }, // Defaulting POV for now
				undefined // Use default model
			);
			if (!res.success || !res.plan) throw new Error(res.error);
			return res.plan;
		},
		onSuccess: (data) => {
			if (data) {
				setGeneratedPlan(data);
				toast.success("Book plan generated successfully!");
				if (autoApply) {
					applyPlan(data);
				}
			}
		},
		onError: (error) => {
			toast.error(error.message || "Failed to generate plan");
		},
	});

	const { mutate: applyPlan, isPending: isApplying } = useMutation({
		mutationFn: async (plan: BookPlan) => {
			if (!projectId)
				throw new Error("Missing projectId or generatedPlan");
			const res = await createBookFromPlan(projectId, plan, {
				genre,
				tone,
				pov: "Third Person",
			});
			if (!res.success) throw new Error(res.error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["project-structure", projectId] });
			toast.success("Book structure created from plan!");
			setGeneratedPlan(null); // Reset after success
		},
		onError: (error) => {
			toast.error(error.message || "Failed to apply plan");
		},
	});

	const progressIndex = isApplying
		? 2
		: isGenerating
			? 1
			: generatedPlan
				? 1
				: 0;

	const handlePresetSelect = (preset: PromptPreset) => {
		setPrompt(preset.prompt);
		setGenre(preset.genre);
		setTone(preset.tone);
	};

	const handleSurpriseMe = () => {
		const preset =
			PROMPT_PRESETS[Math.floor(Math.random() * PROMPT_PRESETS.length)] ??
			PROMPT_PRESETS[0];
		handlePresetSelect(preset);
	};

	const selectedGenreLabel = genre ? GENRE_LABELS[genre] ?? genre : "";
	const selectedToneLabel = tone ? TONE_LABELS[tone] ?? tone : "";

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<Wand2Icon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex items-center gap-2 p-4 border-b border-white/5">
				<SparklesIcon className="h-4 w-4 text-primary" />
				<h3 className="font-semibold text-lg">Book Generator</h3>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-6">
				{!generatedPlan ? (
					<div className="space-y-4">
						<Card className="glass-panel rounded-2xl border border-white/10 p-4">
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div className="space-y-2">
										<Badge variant="glass">Autopilot</Badge>
										<h4 className="text-lg font-semibold">
											Autonomous Book Generation
										</h4>
										<p className="text-sm text-muted-foreground">
											Let the agent assemble your outline and build the book
											structure in one flow, or review the plan step-by-step.
										</p>
									</div>
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<Switch
												id="autopilot"
												checked={autoApply}
												onCheckedChange={setAutoApply}
												aria-describedby="autopilot-description"
											/>
											<Label htmlFor="autopilot" className="text-sm">
												Auto-build book
											</Label>
										</div>
									</div>
								</div>
								<p
									id="autopilot-description"
									className="text-xs text-muted-foreground"
								>
									When enabled, the generator will automatically turn a plan
									into a book structure as soon as it finishes.
								</p>
								<div className="grid gap-3 sm:grid-cols-3">
									{[
										{
											label: "Seed",
											description: "Capture the core idea.",
										},
										{
											label: "Blueprint",
											description: "Plan chapters & beats.",
										},
										{
											label: "Structure",
											description: "Assemble the book.",
										},
									].map((step, index) => {
										const isActive = progressIndex === index;
										const isComplete = progressIndex > index;
										return (
											<div
												key={step.label}
												className={cn(
													"rounded-xl border p-3 transition-colors",
													isComplete && "border-primary/30 bg-primary/10",
													isActive && "border-primary/50 bg-primary/15",
													!isActive &&
														!isComplete &&
														"border-white/10 bg-muted/20",
												)}
											>
												<div className="flex items-center gap-2">
													{isComplete ? (
														<CheckCircle2 className="h-4 w-4 text-primary" />
													) : (
														<div className="h-2.5 w-2.5 rounded-full bg-primary/70" />
													)}
													<p className="text-sm font-medium">{step.label}</p>
												</div>
												<p className="text-xs text-muted-foreground mt-1">
													{step.description}
												</p>
											</div>
										);
									})}
								</div>
							</div>
						</Card>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Quick sparks</Label>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleSurpriseMe}
									className="text-xs"
								>
									<SparklesIcon className="h-3 w-3" />
									Surprise me
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{PROMPT_PRESETS.map((preset) => (
									<Button
										key={preset.label}
										variant="outline"
										size="sm"
										onClick={() => handlePresetSelect(preset)}
									>
										{preset.label}
									</Button>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="prompt">What is your story about?</Label>
							<Textarea
								id="prompt"
								placeholder="A space opera about a lost pilot trying to find her way home..."
								className="min-h-[120px]"
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="genre">Genre</Label>
								<Select value={genre} onValueChange={setGenre}>
									<SelectTrigger id="genre">
										<SelectValue placeholder="Select genre" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="sci-fi">Sci-Fi</SelectItem>
										<SelectItem value="fantasy">Fantasy</SelectItem>
										<SelectItem value="mystery">Mystery</SelectItem>
										<SelectItem value="romance">Romance</SelectItem>
										<SelectItem value="thriller">Thriller</SelectItem>
										<SelectItem value="horror">Horror</SelectItem>
										<SelectItem value="historical">Historical</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tone">Tone</Label>
								<Select value={tone} onValueChange={setTone}>
									<SelectTrigger id="tone">
										<SelectValue placeholder="Select tone" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="dark">Dark</SelectItem>
										<SelectItem value="humorous">Humorous</SelectItem>
										<SelectItem value="serious">Serious</SelectItem>
										<SelectItem value="whimsical">Whimsical</SelectItem>
										<SelectItem value="gritty">Gritty</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<Button
							className="w-full"
							size="lg"
							onClick={() => generate()}
							disabled={!prompt || isGenerating}
						>
							{isGenerating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Generating Plan...
								</>
							) : (
								<>
									<Wand2Icon className="mr-2 h-4 w-4" />
									Generate Plan
								</>
							)}
						</Button>
					</div>
				) : (
					<div className="space-y-6">
						<div className="space-y-4 border rounded-lg p-4 bg-muted/20">
							<div className="space-y-1">
								<h4 className="font-semibold text-xl">{generatedPlan.title}</h4>
								<p className="text-sm text-muted-foreground italic">
									{generatedPlan.logline}
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge variant="glass">Plan ready</Badge>
								{selectedGenreLabel ? (
									<Badge variant="outline">{selectedGenreLabel}</Badge>
								) : null}
								{selectedToneLabel ? (
									<Badge variant="outline">{selectedToneLabel}</Badge>
								) : null}
								{autoApply ? <Badge variant="info">Autopilot on</Badge> : null}
							</div>
							<p className="text-sm">{generatedPlan.synopsis}</p>

							<div className="space-y-2">
								<h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
									Chapters
								</h5>
								<div className="space-y-2 pl-2 border-l-2 border-primary/20">
									{generatedPlan.chapters.map((chapter, i) => (
										<div key={i} className="text-sm">
											<span className="font-medium">
												Chapter {i + 1}: {chapter.title}
											</span>
											<p className="text-xs text-muted-foreground mt-0.5">
												{chapter.summary}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="flex gap-3">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setGeneratedPlan(null)}
								disabled={isApplying}
							>
								Back to Edit
							</Button>
							<Button
								className="flex-1"
								onClick={() => applyPlan(generatedPlan)}
								disabled={isApplying}
							>
								{isApplying ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<BookOpenIcon className="mr-2 h-4 w-4" />
										Create Book
									</>
								)}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
