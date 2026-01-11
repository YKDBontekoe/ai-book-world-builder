"use client";

import {
	Activity,
	AlignVerticalJustifyCenter,
	History,
	Loader2,
	Maximize2,
	Minimize2,
	MoreHorizontal,
	PanelLeftClose,
	PanelLeftOpen,
	Save,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { MetricsDisplay } from "@/components/organisms/writer/metrics-display";
import { SessionInsights } from "@/components/organisms/writer/tools/session-insights";
import { WritingGoals } from "@/components/organisms/writer/tools/writing-goals";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";

type SnapshotButtonSize = "sm" | "xs";

interface SnapshotButtonProps {
	onClick: () => void;
	isSnapshotting: boolean;
	size?: SnapshotButtonSize;
}

function SnapshotButton({
	onClick,
	isSnapshotting,
	size = "sm",
}: SnapshotButtonProps): React.JSX.Element {
	const sizeClasses = size === "xs" ? "h-6 px-2 text-xs" : "h-7 px-2 text-xs";

	return (
		<Button
			variant="ghost"
			size="sm"
			className={cn(sizeClasses, "hover:bg-accent/50")}
			onClick={onClick}
			disabled={isSnapshotting}
		>
			{isSnapshotting ? (
				<Loader2 className="mr-1 h-3 w-3 animate-spin" />
			) : (
				<History className="mr-1 h-3 w-3" />
			)}
			Snapshot
		</Button>
	);
}

/**
 * Header for the writer workspace with navigation, scene context, and controls.
 *
 * @returns {JSX.Element} The writer header UI with primary controls and
 * responsive secondary metadata.
 */
export function WriterHeader(): React.JSX.Element {
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
	const saveStatus = isSaving ? (
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
	) : null;
	const showSecondaryRow = !isZen && (activeScene || saveStatus);
	const shouldShowMetrics = Boolean(
		activeScene && narrativeMetrics.wordCount > 0,
	);

	return (
		<TooltipProvider>
			<div
				className={cn(
					"flex flex-col gap-2 px-4 py-2 shrink-0 z-10 transition-all duration-500",
					// Use consistent glass styling using semantic tokens
					"border-b border-border/50 glass-surface",
					isZen ? "opacity-0 hover:opacity-100 bg-background/80" : "",
				)}
			>
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 min-w-0 flex-1">
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
						<div className="text-sm font-medium truncate min-w-0">
							{activeScene?.title ||
								(hasScenes ? "No scene selected" : "Welcome")}
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-8 w-8 hover:bg-accent/50",
										isDirectorMode &&
											"text-primary bg-primary/10 hover:bg-primary/20",
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
						{showSecondaryRow && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 md:hidden text-muted-foreground hover:text-foreground hover:bg-accent/50"
										aria-label="More writer controls"
									>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-72 p-2">
									<div className="flex flex-col gap-2 text-xs text-muted-foreground">
										{shouldShowMetrics && (
											<MetricsDisplay
												wordCount={narrativeMetrics.wordCount}
												pacingScore={narrativeMetrics.pacingScore}
												readingTimeMinutes={narrativeMetrics.readingTimeMinutes}
												variant="compact"
											/>
										)}
										{activeScene && (
											<>
												<DropdownMenuSeparator />
												<div className="flex flex-wrap items-center gap-2">
													<WritingGoals />
													<SessionInsights />
													<SnapshotButton
														onClick={handleSnapshot}
														isSnapshotting={isSnapshotting}
													/>
												</div>
											</>
										)}
										{saveStatus && (
											<>
												<DropdownMenuSeparator />
												<div className="flex items-center justify-end">
													{saveStatus}
												</div>
											</>
										)}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
				{showSecondaryRow && (
					<div className="hidden md:flex items-center justify-between gap-4 text-xs text-muted-foreground">
						<div className="flex items-center gap-2 flex-wrap">
							{shouldShowMetrics && (
								<MetricsDisplay
									wordCount={narrativeMetrics.wordCount}
									pacingScore={narrativeMetrics.pacingScore}
									readingTimeMinutes={narrativeMetrics.readingTimeMinutes}
									variant="tooltip"
								/>
							)}
							{activeScene && (
								<>
									<div className="h-4 w-[1px] bg-border/50 mx-1" />
									<WritingGoals />
									<SessionInsights />
									<div className="h-4 w-[1px] bg-border/50 mx-1" />
									<SnapshotButton
										onClick={handleSnapshot}
										isSnapshotting={isSnapshotting}
										size="xs"
									/>
								</>
							)}
						</div>
						{saveStatus && (
							<div className="flex items-center gap-2">{saveStatus}</div>
						)}
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}
