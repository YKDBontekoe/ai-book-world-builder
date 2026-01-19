"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpenIcon, Loader2, SparklesIcon, Wand2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	createBookFromPlan,
	generateBookPlan,
} from "@/app/actions/story-generation";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Textarea } from "@/components/atoms/textarea";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import type { BookPlan } from "@/lib/services/story-service";

export function GeneratorPane(): JSX.Element {
	const { projectId } = useBookCanvasLayout();
	const queryClient = useQueryClient();

	const [prompt, setPrompt] = useState("");
	const [genre, setGenre] = useState("");
	const [tone, setTone] = useState("");
	const [generatedPlan, setGeneratedPlan] = useState<BookPlan | null>(null);

	const { mutate: generate, isPending: isGenerating } = useMutation({
		mutationFn: async () => {
			if (!prompt) throw new Error("Prompt is empty");
			const res = await generateBookPlan(
				prompt,
				{ genre, tone, pov: "Third Person" }, // Defaulting POV for now
				undefined, // Use default model
			);
			if (!res.success || !res.plan) throw new Error(res.error);
			return res.plan;
		},
		onSuccess: (data) => {
			if (data) {
				setGeneratedPlan(data);
				toast.success("Book plan generated successfully!");
			}
		},
		onError: (error) => {
			toast.error(error.message || "Failed to generate plan");
		},
	});

	const { mutate: applyPlan, isPending: isApplying } = useMutation({
		mutationFn: async () => {
			if (!projectId || !generatedPlan)
				throw new Error("Missing projectId or generatedPlan");
			const res = await createBookFromPlan(projectId, generatedPlan, {
				genre,
				tone,
				pov: "Third Person",
			});
			if (!res.success) throw new Error(res.error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-structure", projectId],
			});
			toast.success("Book structure created from plan!");
			setGeneratedPlan(null); // Reset after success
		},
		onError: (error) => {
			toast.error(error.message || "Failed to apply plan");
		},
	});

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
							<p className="text-sm">{generatedPlan.synopsis}</p>

							<div className="space-y-2">
								<h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
									Chapters
								</h5>
								<div className="space-y-2 pl-2 border-l-2 border-primary/20">
									{generatedPlan.chapters.map((chapter, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: strictly for preview
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
								onClick={() => applyPlan()}
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
