"use client";

import {
	BookOpen,
	Brain,
	CheckCircle2,
	Coins,
	FileText,
	HelpCircle,
	Image,
	Info,
	Palette,
	PenTool,
	RefreshCw,
	Settings,
	User,
	Wand2, // Keep Wand2 used in header
	Zap,
} from "lucide-react";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SelectionCard } from "@/components/ui/selection-card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TipCard } from "@/components/ui/tip-card";
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

// ModelCard removed, replaced by SelectionCard

// TipCard and GlassSection (CollapsibleSection) moved to components/ui/

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
				<GlassCard padding="lg" rounded="2xl">
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
				</GlassCard>

				{/* Live Cost Estimator - Glass Card */}
				<GlassCard variant="primary" padding="md" rounded="2xl">
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
				</GlassCard>

				{/* AI Model Configuration */}
				<CollapsibleSection
					title="AI Model Configuration"
					icon={<Brain className="h-5 w-5" />}
					defaultOpen={true}
					accentColor="violet"
				>
					<TipCard>{TIPS.models}</TipCard>

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
							{chatModels.map((model) => {
								const benchmark = getModelBenchmark(model.id);
								const isRecommended = isRecommendedFor(model.id, "writing");
								const score = benchmark ? benchmark.writingScore : 3;
								const costTier = benchmark?.costTier || "standard";

								return (
									<SelectionCard
										key={model.id}
										selected={settings.writerModelId === model.id}
										recommended={isRecommended}
										onClick={() => updateSetting("writerModelId", model.id)}
										title={model.name}
										icon={
											<div
												className={cn(
													"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
													score >= 5 &&
														"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
													score === 4 &&
														"bg-blue-500/15 text-blue-600 dark:text-blue-400",
													score === 3 &&
														"bg-amber-500/15 text-amber-600 dark:text-amber-400",
													score < 3 && "bg-muted text-muted-foreground",
												)}
											>
												{score}/5
											</div>
										}
										footer={
											<div className="flex items-center gap-1.5 opacity-80">
												<span>${model.pricing?.output}/1M</span>
												<span className="opacity-40">·</span>
												<span className="capitalize">{costTier}</span>
											</div>
										}
									/>
								);
							})}
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
							{chatModels.map((model) => {
								const benchmark = getModelBenchmark(model.id);
								const isRecommended = isRecommendedFor(model.id, "reviewing");
								const score = benchmark ? benchmark.reviewingScore : 3;
								const costTier = benchmark?.costTier || "standard";

								return (
									<SelectionCard
										key={model.id}
										selected={settings.reviewerModelId === model.id}
										recommended={isRecommended}
										onClick={() => updateSetting("reviewerModelId", model.id)}
										title={model.name}
										icon={
											<div
												className={cn(
													"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
													score >= 5 &&
														"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
													score === 4 &&
														"bg-blue-500/15 text-blue-600 dark:text-blue-400",
													score === 3 &&
														"bg-amber-500/15 text-amber-600 dark:text-amber-400",
													score < 3 && "bg-muted text-muted-foreground",
												)}
											>
												{score}/5
											</div>
										}
										footer={
											<div className="flex items-center gap-1.5 opacity-80">
												<span>${model.pricing?.output}/1M</span>
												<span className="opacity-40">·</span>
												<span className="capitalize">{costTier}</span>
											</div>
										}
									/>
								);
							})}
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
									<SelectionCard
										key={model.id}
										// Since image model selection isn't in settings interface yet, we mock selection logic or check if it's there
										// For now, assuming first is default or check generic
										selected={false}
										// Note: real implementation would need imageModelId in settingsSchema.
										// Leaving onClick as placeholder
										onClick={() => {}}
										title={model.name}
										description={model.description}
										pricing={model.pricing}
									/>
								))}
							</div>
						</div>
					)}
				</CollapsibleSection>

				{/* Chapter Settings */}
				<CollapsibleSection
					title="Chapter Structure"
					icon={<BookOpen className="h-5 w-5" />}
					defaultOpen={true}
					accentColor="blue"
				>
					<TipCard>{TIPS.chapters}</TipCard>

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
				</CollapsibleSection>

				{/* Writing Style */}
				<CollapsibleSection
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
							<TipCard>{TIPS.style}</TipCard>
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
				</CollapsibleSection>

				{/* Book Metadata */}
				<CollapsibleSection
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
				</CollapsibleSection>

				{/* Additional Options */}
				<CollapsibleSection
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
				</CollapsibleSection>
			</div>
		</TooltipProvider>
	);
}
