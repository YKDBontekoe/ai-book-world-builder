"use client";

import {
	Activity,
	AlignVerticalJustifyCenter,
	History,
	Loader2,
	Maximize2,
	Minimize2,
	PanelLeftClose,
	PanelLeftOpen,
	Save,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { cn } from "@/lib/utils";

export function WriterHeader() {
	const {
		activeScene,
		structure,
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

	const hasScenes = structure
		? structure.some((c) => c.scenes.length > 0)
		: false;
	const isZen = viewMode === "zen";

	return (
		<div
			className={cn(
				"flex items-center justify-between border-b px-4 py-2 shrink-0 z-10 transition-all duration-500",
				"glass-surface",
				isZen ? "opacity-0 hover:opacity-100 bg-background/80" : "",
			)}
		>
			<div className="flex items-center gap-2 overflow-hidden">
				{!isZen && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 text-muted-foreground"
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
									"h-8 w-8",
									isDirectorMode && "text-primary bg-primary/10",
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
									"h-8 w-8",
									isTypewriterMode && "text-primary bg-primary/10",
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
								className={cn("h-8 w-8", isZen && "text-primary bg-primary/10")}
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
						<div className="h-4 w-[1px] bg-border mx-1" />
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs"
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
						<div className="h-4 w-[1px] bg-border mx-1" />
						{isSaving ? (
							<>
								<Loader2 className="h-3 w-3 animate-spin" />
								Saving...
							</>
						) : lastSaved ? (
							<>
								<Save className="h-3 w-3" />
								Saved
							</>
						) : null}
					</>
				)}
			</div>
		</div>
	);
}
