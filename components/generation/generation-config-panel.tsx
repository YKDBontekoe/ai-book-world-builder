"use client";

import {
	BookOpen,
	Brain,
	CheckCircle2,
	ChevronDown,
	Coins,
	FileText,
	HelpCircle,
	Image,
	Info,
	Lightbulb,
	Palette,
	PenTool,
	RefreshCw,
	Settings,
	Sparkles,
	User,
	Wand2,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	getModelBenchmark,
	isRecommendedFor,
} from "@/lib/ai/benchmark-service";
import { type ChatModel, chatModels } from "@/lib/ai/models";
import { type GenerationSettings, writingStylePresets } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface GenerationConfigPanelProps {
	projectId: string;
	settings: Partial<GenerationSettings>;
	onSettingsChange?: (settings: Partial<GenerationSettings>) => void;
}

const TIPS = {
	chapters:
		"Start with fewer chapters for your first draft. You can always expand later!",
	models:
		"Use GPT-4o mini for reviewing to cut costs by ~80% without losing quality.",
	revision:
		"2 revision rounds catches most issues. 3 rounds for polished literary fiction.",
	style:
		"Custom styles work best when you describe the mood, pacing, and vocabulary level.",
};

// All models available for both writer and reviewer

const imageModels = [
	{
		id: "dall-e-3",
		name: "DALL-E 3",
		provider: "OpenAI",
		pricing: "$0.04/image",
		description: "High quality, artistic",
	},
	{
		id: "midjourney",
		name: "Midjourney",
		provider: "Midjourney",
		pricing: "$0.02/image",
		description: "Stylized, creative",
	},
	{
		id: "stable-diffusion",
		name: "Stable Diffusion XL",
		provider: "Stability",
		pricing: "$0.002/image",
		description: "Fast, customizable",
	},
];

function ModelCard({
	model,
	selected,
	onSelect,
	role,
}: {
	model: ChatModel;
	selected: boolean;
	onSelect: () => void;
	role: "writing" | "reviewing";
}) {
	const benchmark = getModelBenchmark(model.id);
	const isRecommended = isRecommendedFor(model.id, role);
	const score = benchmark
		? role === "writing"
			? benchmark.writingScore
			: benchmark.reviewingScore
		: 3;
	const costTier = benchmark?.costTier || "standard";

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
				selected
					? "border-primary bg-primary/5 ring-2 ring-primary"
					: "border-border/50 bg-background/50 hover:bg-muted/50 hover:border-border",
				isRecommended && !selected && "border-amber-500/40",
			)}
		>
			{/* Score circle */}
			<div
				className={cn(
					"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
					score >= 5 &&
						"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
					score === 4 && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
					score === 3 && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
					score < 3 && "bg-muted text-muted-foreground",
				)}
			>
				{score}/5
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="font-medium truncate">{model.name}</span>
					{isRecommended && (
						<Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
					)}
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
					<span>${model.pricing?.output}/1M</span>
					<span className="opacity-40">·</span>
					<span className="capitalize">{costTier}</span>
					{benchmark?.contextWindow && (
						<>
							<span className="opacity-40">·</span>
							<span>{benchmark.contextWindow}</span>
						</>
					)}
				</div>
			</div>

			{/* Selection indicator */}
			{selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
		</button>
	);
}

function TipCard({ tip, icon }: { tip: string; icon?: React.ReactNode }) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 backdrop-blur-sm">
			{icon || <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />}
			<p className="text-sm text-blue-700 dark:text-blue-300">{tip}</p>
		</div>
	);
}

function GlassSection({
	title,
	icon,
	children,
	defaultOpen = false,
	accentColor = "primary",
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	defaultOpen?: boolean;
	accentColor?: "primary" | "blue" | "violet" | "pink" | "amber" | "emerald";
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const colorClasses = {
		primary: "text-primary",
		blue: "text-blue-500",
		violet: "text-violet-500",
		pink: "text-pink-500",
		amber: "text-amber-500",
		emerald: "text-emerald-500",
	};

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm">
				<CollapsibleTrigger asChild>
					<CardHeader className="cursor-pointer transition-colors hover:bg-muted/30">
						<CardTitle className="flex items-center justify-between text-base">
							<div className="flex items-center gap-2">
								<span className={colorClasses[accentColor]}>{icon}</span>
								{title}
							</div>
							<ChevronDown
								className={cn(
									"h-4 w-4 text-muted-foreground transition-transform",
									isOpen && "rotate-180",
								)}
							/>
						</CardTitle>
					</CardHeader>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent className="space-y-4 pt-0">{children}</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}

export function GenerationConfigPanel({
	settings,
	onSettingsChange,
}: GenerationConfigPanelProps) {
	const updateSetting = <K extends keyof GenerationSettings>(
		key: K,
		value: GenerationSettings[K],
	) => {
		onSettingsChange?.({ ...settings, [key]: value });
	};

	// Calculate estimates
	const estimatedWords =
		(settings.totalChapters || 10) * (settings.pagesPerChapter || 8) * 250;
	const writerModel = chatModels.find((m) => m.id === settings.writerModelId);
	const reviewerModel = chatModels.find(
		(m) => m.id === settings.reviewerModelId,
	);
	const writerCost =
		((estimatedWords * 1.3) / 1000000) *
		parseFloat(writerModel?.pricing?.output || "3");
	const reviewerCost =
		((estimatedWords * 0.5) / 1000000) *
		parseFloat(reviewerModel?.pricing?.output || "0.6") *
		(settings.revisionRounds || 1);
	const totalCost = writerCost + reviewerCost;

	return (
		<TooltipProvider>
			<div className="space-y-4">
				{/* Header */}
				<div className="rounded-2xl border border-border/50 bg-background/50 p-6 backdrop-blur-sm">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<Settings className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold">Generation Settings</h2>
							<p className="text-sm text-muted-foreground">
								Configure AI models and book parameters
							</p>
						</div>
					</div>
				</div>

				{/* Live Cost Estimator - Glass Card */}
				<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Coins className="h-5 w-5 text-primary" />
							<span className="font-medium">Estimated Cost</span>
							<Tooltip>
								<TooltipTrigger>
									<HelpCircle className="h-4 w-4 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>
										Based on ~{estimatedWords.toLocaleString()} words with
										current model selection.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<div className="text-right">
							<p className="text-2xl font-bold text-primary">
								${totalCost.toFixed(2)}
							</p>
							<p className="text-xs text-muted-foreground">
								Writer: ${writerCost.toFixed(2)} • Reviewer: $
								{reviewerCost.toFixed(2)}
							</p>
						</div>
					</div>
				</div>

				{/* AI Model Configuration */}
				<GlassSection
					title="AI Model Configuration"
					icon={<Brain className="h-5 w-5" />}
					defaultOpen={true}
					accentColor="violet"
				>
					<TipCard tip={TIPS.models} />

					{/* Writer Model */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Wand2 className="h-4 w-4 text-violet-500" />
							<Label className="text-sm font-semibold">Writer Model</Label>
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-3.5 w-3.5 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>The main model that generates your story content.</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							{chatModels.map((model) => (
								<ModelCard
									key={model.id}
									model={model}
									selected={settings.writerModelId === model.id}
									onSelect={() => updateSetting("writerModelId", model.id)}
									role="writing"
								/>
							))}
						</div>
					</div>

					{/* Reviewer Model */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							<Label className="text-sm font-semibold">Reviewer Model</Label>
							<Tooltip>
								<TooltipTrigger>
									<Info className="h-3.5 w-3.5 text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>
										Reviews and suggests improvements. Can be cheaper as it only
										analyzes.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							{chatModels.map((model) => (
								<ModelCard
									key={model.id}
									model={model}
									selected={settings.reviewerModelId === model.id}
									onSelect={() => updateSetting("reviewerModelId", model.id)}
									role="reviewing"
								/>
							))}
						</div>
					</div>

					{/* Image Model */}
					{settings.generateFrontCover && (
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Image className="h-4 w-4 text-pink-500" />
								<Label className="text-sm font-semibold">
									Image Generation
								</Label>
							</div>
							<div className="grid gap-2 sm:grid-cols-3">
								{imageModels.map((model) => (
									<button
										key={model.id}
										type="button"
										className={cn(
											"flex flex-col gap-1 rounded-xl border p-3 text-left backdrop-blur-sm transition-all",
											model.id === "dall-e-3"
												? "border-primary bg-primary/5 ring-1 ring-primary"
												: "border-border/50 bg-background/50 hover:bg-background/80",
										)}
									>
										<span className="font-medium">{model.name}</span>
										<span className="text-xs text-muted-foreground">
											{model.description}
										</span>
										<span className="text-xs text-primary">
											{model.pricing}
										</span>
									</button>
								))}
							</div>
						</div>
					)}
				</GlassSection>

				{/* Chapter Settings */}
				<GlassSection
					title="Chapter Structure"
					icon={<BookOpen className="h-5 w-5" />}
					defaultOpen={true}
					accentColor="blue"
				>
					<TipCard tip={TIPS.chapters} />

					<div className="space-y-6">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Number of Chapters</Label>
								<span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-lg font-bold text-primary">
									{settings.totalChapters || 10}
								</span>
							</div>
							<Slider
								value={[settings.totalChapters || 10]}
								onValueChange={([v]) => updateSetting("totalChapters", v)}
								min={1}
								max={50}
								step={1}
								className="py-2"
							/>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>Short Story</span>
								<span>Novel</span>
								<span>Epic</span>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Pages per Chapter</Label>
								<span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-lg font-bold text-primary">
									{settings.pagesPerChapter || 8}
								</span>
							</div>
							<Slider
								value={[settings.pagesPerChapter || 8]}
								onValueChange={([v]) => updateSetting("pagesPerChapter", v)}
								min={1}
								max={30}
								step={1}
							/>
							<p className="text-xs text-muted-foreground">
								≈ {((settings.pagesPerChapter || 8) * 250).toLocaleString()}{" "}
								words per chapter
							</p>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Label>Revision Rounds</Label>
									<Tooltip>
										<TooltipTrigger>
											<Info className="h-3.5 w-3.5 text-muted-foreground" />
										</TooltipTrigger>
										<TooltipContent>
											<p>More rounds = higher quality but higher cost</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-lg font-bold text-primary">
									{settings.revisionRounds || 1}
								</span>
							</div>
							<Slider
								value={[settings.revisionRounds || 1]}
								onValueChange={([v]) => updateSetting("revisionRounds", v)}
								min={1}
								max={3}
								step={1}
							/>
							<p className="text-xs text-muted-foreground">
								Each round: Draft → Review → Revise
							</p>
						</div>
					</div>
				</GlassSection>

				{/* Writing Style */}
				<GlassSection
					title="Writing Style"
					icon={<Palette className="h-5 w-5" />}
					accentColor="pink"
				>
					<div className="space-y-2">
						<Label>Style Preset</Label>
						<Select
							value={settings.writingStylePreset}
							onValueChange={(v) =>
								updateSetting("writingStylePreset", v as any)
							}
						>
							<SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{writingStylePresets.map((preset) => (
									<SelectItem
										key={preset.id}
										value={preset.id}
										className="py-3"
									>
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

					{settings.writingStylePreset === "custom" && (
						<>
							<TipCard tip={TIPS.style} />
							<div className="space-y-2">
								<Label>Custom Style Description</Label>
								<Textarea
									placeholder="Describe the writing style you want..."
									value={settings.customStyleDescription || ""}
									onChange={(e) =>
										updateSetting("customStyleDescription", e.target.value)
									}
									rows={4}
									className="resize-none rounded-xl border-border/50 bg-background/50"
								/>
							</div>
						</>
					)}

					<div className="space-y-2">
						<Label>Author Inspirations</Label>
						<Textarea
							placeholder="e.g., Brandon Sanderson, Patrick Rothfuss..."
							value={settings.authorInspirations?.join(", ") || ""}
							onChange={(e) =>
								updateSetting(
									"authorInspirations",
									e.target.value.split(",").map((s) => s.trim()),
								)
							}
							rows={2}
							className="rounded-xl border-border/50 bg-background/50"
						/>
					</div>
				</GlassSection>

				{/* Book Metadata */}
				<GlassSection
					title="Book Metadata"
					icon={<FileText className="h-5 w-5" />}
					accentColor="amber"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>Book Title</Label>
							<input
								type="text"
								className="flex h-10 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm backdrop-blur-sm transition-colors focus:ring-2 focus:ring-primary/20"
								placeholder="Enter book title..."
								value={settings.bookTitle || ""}
								onChange={(e) => updateSetting("bookTitle", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>Author Name</Label>
							<input
								type="text"
								className="flex h-10 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm backdrop-blur-sm transition-colors focus:ring-2 focus:ring-primary/20"
								placeholder="Enter author name..."
								value={settings.authorName || ""}
								onChange={(e) => updateSetting("authorName", e.target.value)}
							/>
						</div>
						<div className="space-y-2 sm:col-span-2">
							<Label>Genre</Label>
							<Select
								value={settings.genre}
								onValueChange={(v) => updateSetting("genre", v)}
							>
								<SelectTrigger className="rounded-xl border-border/50 bg-background/50">
									<SelectValue placeholder="Select genre..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="fantasy">Fantasy</SelectItem>
									<SelectItem value="scifi">Science Fiction</SelectItem>
									<SelectItem value="mystery">Mystery</SelectItem>
									<SelectItem value="romance">Romance</SelectItem>
									<SelectItem value="thriller">Thriller</SelectItem>
									<SelectItem value="literary">Literary Fiction</SelectItem>
									<SelectItem value="horror">Horror</SelectItem>
									<SelectItem value="historical">Historical Fiction</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</GlassSection>

				{/* Additional Options */}
				<GlassSection
					title="Additional Options"
					icon={<Zap className="h-5 w-5" />}
					accentColor="emerald"
				>
					<div className="grid gap-3 sm:grid-cols-2">
						{[
							{
								key: "includePrologue",
								label: "Prologue",
								desc: "Opening scene",
								icon: <BookOpen className="h-4 w-4" />,
							},
							{
								key: "includeEpilogue",
								label: "Epilogue",
								desc: "Closing scene",
								icon: <BookOpen className="h-4 w-4" />,
							},
							{
								key: "generateBackCoverBlurb",
								label: "Back Cover Blurb",
								desc: "Marketing text",
								icon: <PenTool className="h-4 w-4" />,
							},
							{
								key: "generateFrontCover",
								label: "Front Cover Art",
								desc: "AI cover image",
								icon: <Image className="h-4 w-4" />,
							},
							{
								key: "generateCharacterSheets",
								label: "Character Sheets",
								desc: "Character profiles",
								icon: <User className="h-4 w-4" />,
							},
							{
								key: "generateChapterSummaries",
								label: "Chapter Summaries",
								desc: "Chapter synopses",
								icon: <FileText className="h-4 w-4" />,
							},
							{
								key: "generateTableOfContents",
								label: "Table of Contents",
								desc: "Auto TOC",
								icon: <FileText className="h-4 w-4" />,
							},
							{
								key: "runConsistencyCheck",
								label: "Consistency Check",
								desc: "Quality analysis",
								icon: <RefreshCw className="h-4 w-4" />,
							},
						].map((option) => (
							<div
								key={option.key}
								className={cn(
									"flex items-center justify-between rounded-xl border p-3 backdrop-blur-sm transition-all",
									settings[option.key as keyof GenerationSettings]
										? "border-primary/30 bg-primary/5"
										: "border-border/50 bg-background/50 hover:bg-muted/30",
								)}
							>
								<div className="flex items-center gap-3">
									<span className="text-muted-foreground">{option.icon}</span>
									<div>
										<Label className="text-sm font-medium">
											{option.label}
										</Label>
										<p className="text-xs text-muted-foreground">
											{option.desc}
										</p>
									</div>
								</div>
								<Switch
									checked={
										settings[option.key as keyof GenerationSettings] as boolean
									}
									onCheckedChange={(checked) =>
										updateSetting(
											option.key as keyof GenerationSettings,
											checked as any,
										)
									}
								/>
							</div>
						))}
					</div>
				</GlassSection>
			</div>
		</TooltipProvider>
	);
}
