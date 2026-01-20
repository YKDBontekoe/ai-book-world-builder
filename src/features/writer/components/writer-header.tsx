"use client";

import {
	Activity,
	AlignVerticalJustifyCenter,
	CheckCircle2,
	Loader2,
	Maximize2,
	Minimize2,
	PanelLeftClose,
	PanelLeftOpen,
} from "lucide-react";
import type React from "react";
import { memo } from "react";
import { Button } from "@/components/atoms/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { useWriterContent } from "@/features/writer/components/writer-content-context";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { WriterToolsMenu } from "@/features/writer/components/writer-tools-menu";
import { cn } from "@/lib/utils";

/**
 * Header for the writer workspace with navigation, scene context, and controls.
 *
 * @returns {JSX.Element} The writer header UI with primary controls and
 * responsive secondary metadata.
 */
export const WriterHeader = memo(function WriterHeader(): React.JSX.Element {
	const { activeScene, structure } = useWriterContext();
	const { isSaving, lastSaved } = useWriterContent();

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
		<TooltipProvider>
			<div
				className={cn(
					"flex items-center justify-between gap-3 px-4 h-14 shrink-0 z-10 transition-all duration-500",
					// Use consistent glass styling using semantic tokens
					"border-b border-border/50 glass-surface",
					isZen ? "opacity-0 hover:opacity-100 bg-background/80" : "",
				)}
			>
				{/* LEFT: Navigation & Context */}
				<div className="flex items-center gap-3 min-w-0 flex-1">
					{!isZen && (
						<Tooltip>
							<TooltipTrigger asChild>
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
							</TooltipTrigger>
							<TooltipContent side="bottom">
								{isSidebarOpen ? "Close Sidebar" : "Open Sidebar"} (⌘B)
							</TooltipContent>
						</Tooltip>
					)}

					<div className="flex items-center gap-2 min-w-0">
						<div className="text-sm font-medium truncate">
							{activeScene?.title ||
								(hasScenes ? "No scene selected" : "Welcome")}
						</div>
						{/* Subtle Save Status Indicator */}
						{isSaving ? (
							<Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />
						) : lastSaved ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="flex items-center justify-center h-3 w-3 text-muted-foreground/30 hover:text-green-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500/50 rounded-full"
										aria-label={`Saved at ${lastSaved.toLocaleTimeString()}`}
									>
										<CheckCircle2 className="h-3 w-3" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="text-xs">
									Saved {lastSaved.toLocaleTimeString()}
								</TooltipContent>
							</Tooltip>
						) : null}
					</div>
				</div>

				{/* RIGHT: View Modes & Tools */}
				<div className="flex items-center gap-1 shrink-0">
					{/* View Mode Group */}
					<div className="flex items-center p-0.5 bg-accent/20 rounded-lg border border-border/20 mr-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-7 w-7 rounded-md transition-all",
										isDirectorMode
											? "bg-background shadow-sm text-foreground"
											: "text-muted-foreground hover:text-foreground hover:bg-transparent",
									)}
									onClick={toggleDirectorMode}
								>
									<Activity className="h-3.5 w-3.5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">Director Mode</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-7 w-7 rounded-md transition-all",
										isTypewriterMode
											? "bg-background shadow-sm text-foreground"
											: "text-muted-foreground hover:text-foreground hover:bg-transparent",
									)}
									onClick={toggleTypewriterMode}
								>
									<AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">Typewriter Mode</TooltipContent>
						</Tooltip>
					</div>

					{/* Tools & Zen */}
					<div className="flex items-center gap-1">
						{activeScene && <WriterToolsMenu />}

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-8 w-8 hover:bg-accent/50 text-muted-foreground",
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
							<TooltipContent side="bottom">
								{isZen ? "Exit Zen Mode" : "Enter Zen Mode"}
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
});
