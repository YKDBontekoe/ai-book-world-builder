"use client";

import {
	CheckCircle2,
	ChevronRight,
	FileText,
	Loader2,
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
import { WriterViewControls } from "@/features/writer/components/header/writer-view-controls";
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
			<header
				className={cn(
					"flex items-center justify-between gap-4 px-4 h-14 shrink-0 z-20 transition-all duration-500 ease-spring",
					"bg-glass backdrop-blur-[50px] backdrop-saturate-150 border-b border-glass-border",
					isZen &&
						"opacity-0 hover:opacity-100 -mt-14 hover:mt-0",
				)}
			>
				{/* LEFT: Navigation & Context */}
				<div className="flex items-center gap-3 min-w-0 flex-1">
					{!isZen && (
						<div className="flex items-center">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
										onClick={toggleSidebar}
										aria-label={
											isSidebarOpen ? "Close Sidebar" : "Open Sidebar"
										}
									>
										{isSidebarOpen ? (
											<PanelLeftClose className="h-4.5 w-4.5" />
										) : (
											<PanelLeftOpen className="h-4.5 w-4.5" />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{isSidebarOpen ? "Close Sidebar" : "Open Sidebar"} (⌘B)
								</TooltipContent>
							</Tooltip>
							<div className="h-5 w-px bg-border/40 mx-1.5" />
						</div>
					)}

					<div className="flex items-center gap-2 min-w-0 group">
						<div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/5 text-primary">
							<FileText className="h-4 w-4" />
						</div>

						<div className="flex flex-col min-w-0 justify-center">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold truncate text-foreground/90">
									{activeScene?.title ||
										(hasScenes ? "No scene selected" : "Welcome")}
								</span>

								{/* Save Status - Subtle & Integrated */}
								<div className="flex items-center w-4 h-4 justify-center">
									{isSaving ? (
										<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
									) : lastSaved ? (
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
													<CheckCircle2 className="h-3 w-3 text-emerald-500/80" />
												</div>
											</TooltipTrigger>
											<TooltipContent side="right" className="text-xs">
												Saved{" "}
												{lastSaved.toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</TooltipContent>
										</Tooltip>
									) : null}
								</div>
							</div>

							{activeScene && (
								<div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
									<span>Scene</span>
									<ChevronRight className="h-2.5 w-2.5 opacity-50" />
									<span className="truncate max-w-[150px]">Draft</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* RIGHT: View Modes & Tools */}
				<div className="flex items-center gap-3 shrink-0">
					{activeScene && (
						<>
							<WriterToolsMenu />
							<div className="h-5 w-px bg-border/40" />
						</>
					)}

					<WriterViewControls
						isDirectorMode={isDirectorMode}
						toggleDirectorMode={toggleDirectorMode}
						isTypewriterMode={isTypewriterMode}
						toggleTypewriterMode={toggleTypewriterMode}
						isZenMode={isZen}
						toggleZenMode={toggleZenMode}
					/>
				</div>
			</header>
		</TooltipProvider>
	);
});
