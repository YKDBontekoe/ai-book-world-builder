"use client";

import {
	Activity,
	AlignVerticalJustifyCenter,
	BookOpen,
	History,
	Loader2,
	Maximize2,
	Minimize2,
	PanelLeftClose,
	PanelLeftOpen,
	Save,
	TrendingUp,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { SessionInsights } from "@/components/organisms/writer/tools/session-insights";
import { WritingGoals } from "@/components/organisms/writer/tools/writing-goals";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";

export function WriterHeader() {
	const {
		project,
		activeScene,
		structure,
		sceneContent,
		handleSnapshot,
		isSnapshotting,
		isSaving,
		lastSaved,
	} = useWriterContext();

	const {
		isSidebarOpen,
		toggleSidebar,
		viewMode,
		toggleZenMode,
		isTypewriterMode,
		toggleTypewriterMode,
		isDirectorMode,
		toggleDirectorMode,
	} = useWriterLayoutContext();

	const { data: entities } = useProjectEntities(project.id);
	const narrativeMetrics = useNarrativeIntelligence({
		content: sceneContent || "",
		entities: entities || [],
	});

	const hasScenes = structure
		? structure.some((c) => c.scenes.length > 0)
		: false;
	const isZen = viewMode === "zen";

	return (
		<div
			className={cn(
				"flex items-center justify-between px-4 py-2 shrink-0 z-10 transition-all duration-500",
				// Use consistent glass styling using semantic tokens
				"border-b border-border/50 glass-surface",
				isZen ? "opacity-0 hover:opacity-100 bg-background/80" : "",
			)}
		>
			<div className="flex items-center gap-2 overflow-hidden">
				{!isZen && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/50"
						onClick={toggleSidebar}
						aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
					>
						{isSidebarOpen ? (
							<PanelLeftClose className="h-4 w-4" />
						) : (
							<PanelLeftOpen className="h-4 w-4" />
						)}
					</Button>
				)}
				<div className="text-sm font-medium truncate max-w-[200px]">
					{activeScene?.title || (hasScenes ? "No scene selected" : "Welcome")}
				</div>
			</div>
			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									"h-8 w-8 hover:bg-accent/50",
									isDirectorMode && "text-primary bg-primary/10 hover:bg-primary/20",
								)}
								onClick={toggleDirectorMode}
							>
								<Activity className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Director Mode (Live Analysis)</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									"h-8 w-8 hover:bg-accent/50",
									isTypewriterMode &&
										"text-primary bg-primary/10 hover:bg-primary/20",
								)}
								onClick={toggleTypewriterMode}
							>
								<AlignVerticalJustifyCenter className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Typewriter Mode</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									"h-8 w-8 hover:bg-accent/50",
									isZen && "text-primary bg-primary/10 hover:bg-primary/20",
								)}
								onClick={toggleZenMode}
							>
								{isZen ? (
									<Minimize2 className="h-4 w-4" />
								) : (
									<Maximize2 className="h-4 w-4" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{isZen ? "Exit Zen Mode" : "Enter Zen Mode"}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{activeScene && !isZen && (
					<>
						<div className="h-4 w-[1px] bg-border/50 mx-1" />
						{/* Writing Quality Indicators */}
						{narrativeMetrics.wordCount > 0 && (
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/30 hover:bg-accent/50 transition-colors text-xs cursor-default">
											<BookOpen className="h-3 w-3" />
											<span className="font-mono">
												{narrativeMetrics.wordCount.toLocaleString()}
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										Word Count • {narrativeMetrics.readingTimeMinutes} min read
									</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<div
											className={cn(
												"flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-default",
												narrativeMetrics.pacingScore > 70
													? "bg-orange-500/10 text-orange-500"
													: narrativeMetrics.pacingScore < 30
														? "bg-blue-500/10 text-blue-500"
														: "bg-green-500/10 text-green-500",
											)}
										>
											<TrendingUp className="h-3 w-3" />
											{Math.round(narrativeMetrics.pacingScore)}
										</div>
									</TooltipTrigger>
									<TooltipContent>
										Pacing Score:{" "}
										{narrativeMetrics.pacingScore > 70
											? "Fast/Action"
											: narrativeMetrics.pacingScore < 30
												? "Slow/Descriptive"
												: "Balanced"}
									</TooltipContent>
								</Tooltip>
							</>
						)}
						<div className="h-4 w-[1px] bg-border/50 mx-1" />
						<WritingGoals />
						<SessionInsights />
						<div className="h-4 w-[1px] bg-border/50 mx-1" />
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs hover:bg-accent/50"
							onClick={handleSnapshot}
							disabled={isSnapshotting}
						>
							{isSnapshotting ? (
								<Loader2 className="mr-1 h-3 w-3 animate-spin" />
							) : (
								<History className="mr-1 h-3 w-3" />
							)}
							Snapshot
						</Button>
					</>
				)}

				{!isZen && (
					<>
						<div className="h-4 w-[1px] bg-border/50 mx-1" />
						{isSaving ? (
							<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span className="text-[10px] font-medium uppercase tracking-wider">
									Saving
								</span>
							</div>
						) : lastSaved ? (
							<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/30 text-muted-foreground transition-opacity duration-1000">
								<Save className="h-3 w-3" />
								<span className="text-[10px] font-medium uppercase tracking-wider">
									Saved
								</span>
							</div>
						) : null}
					</>
				)}
			</div>
		</div>
	);
}
