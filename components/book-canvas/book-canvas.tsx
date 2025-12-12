"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ActivityIcon,
	BookOpenIcon,
	CalendarIcon,
	ChevronRightIcon,
	FileTextIcon,
	HistoryIcon,
	LayoutIcon,
	LibraryIcon,
	SparklesIcon,
	XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type CanvasPane, useBookCanvas } from "./book-canvas-context";
import { BiblePane } from "./panes/bible-pane";
import { ChangeLogPane } from "./panes/changelog-pane";
import { DiagnosticsPane } from "./panes/diagnostics-pane";
import { DraftPane } from "./panes/draft-pane";
import { OutlinePane } from "./panes/outline-pane";
import { ScenePane } from "./panes/scene-pane";
import { TimelinePane } from "./panes/timeline-pane";

export function BookCanvas() {
	const { isOpen, setIsOpen, activePane, setActivePane, overallStatus } =
		useBookCanvas();

	const renderContent = () => {
		switch (activePane) {
			case "outline":
				return <OutlinePane />;
			case "timeline":
				return <TimelinePane />;
			case "scenes":
				return <ScenePane />;
			case "draft":
				return <DraftPane />;
			case "diagnostics":
				return <DiagnosticsPane />;
			case "bible":
				return <BiblePane />;
			case "changes":
				return <ChangeLogPane />;
			default:
				return <OutlinePane />;
		}
	};

	const tabs: { id: CanvasPane; label: string; icon: any }[] = [
		{ id: "outline", label: "Outline", icon: LayoutIcon },
		{ id: "timeline", label: "Timeline", icon: CalendarIcon },
		{ id: "scenes", label: "Scenes", icon: LibraryIcon },
		{ id: "draft", label: "Draft", icon: FileTextIcon },
		{ id: "diagnostics", label: "Readiness", icon: ActivityIcon },
		{ id: "bible", label: "Bible", icon: BookOpenIcon },
		{ id: "changes", label: "Log", icon: HistoryIcon },
	];

	// Collapsed state - show expand button
	if (!isOpen) {
		return (
			<div className="hidden h-dvh w-12 flex-shrink-0 flex-col items-center border-l border-white/10 bg-muted/10 py-4 md:flex z-50">
				<Button
					className="h-10 w-10 rounded-full bg-white/50 backdrop-blur-sm shadow-sm"
					onClick={() => setIsOpen(true)}
					size="icon"
					variant="ghost"
				>
					<ChevronRightIcon className="h-5 w-5 rotate-180" />
				</Button>
				<div className="mt-4 flex flex-1 flex-col items-center gap-2">
					{tabs.slice(0, 4).map((tab) => (
						<Button
							className={cn(
								"h-9 w-9 rounded-lg",
								activePane === tab.id && "bg-primary/10 text-primary",
							)}
							key={tab.id}
							onClick={() => {
								setActivePane(tab.id);
								setIsOpen(true);
							}}
							size="icon"
							title={tab.label}
							variant="ghost"
						>
							<tab.icon className="h-4 w-4" />
						</Button>
					))}
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex h-dvh w-full flex-col bg-background/95 backdrop-blur-xl md:static md:flex md:w-[380px] md:bg-background/50 md:backdrop-blur-xl md:shadow-2xl md:border-l border-white/20 dark:border-white/5 flex-shrink-0",
				"transition-all duration-300 ease-in-out",
				"lg:w-[420px]",
			)}
		>
			{/* Header with gradient */}
			<div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-transparent p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
						<SparklesIcon className="h-4 w-4" />
					</div>
					<div>
						<h2 className="font-semibold text-sm">Book Canvas</h2>
						<span
							className={cn(
								"text-xs font-medium",
								overallStatus === "running"
									? "text-blue-500 animate-pulse"
									: "text-muted-foreground",
							)}
						>
							{overallStatus === "running" ? "Generating..." : "Ready"}
						</span>
					</div>
				</div>
				<Button
					className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
					onClick={() => setIsOpen(false)}
					size="icon"
					variant="ghost"
				>
					<XIcon className="h-4 w-4" />
				</Button>
			</div>

			{/* Tabs with Segmented Control styling */}
			<div className="px-3 py-2">
				<div className="flex overflow-x-auto rounded-lg bg-muted/30 p-1 gap-1 scrollbar-hide">
					{tabs.map((tab) => {
						const isActive = activePane === tab.id;
						return (
							<button
								className={cn(
									"relative flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 font-medium text-xs transition-all",
									isActive
										? "text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
								key={tab.id}
								onClick={() => setActivePane(tab.id)}
								type="button"
							>
								{isActive && (
									<motion.div
										layoutId="activeTab"
										className="absolute inset-0 rounded-md bg-background shadow-sm"
										transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
									/>
								)}
								<span className="relative z-10 flex flex-col items-center gap-1">
									<tab.icon className="h-4 w-4" />
									<span className="text-[10px] uppercase tracking-wide">
										{tab.label}
									</span>
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-y-auto bg-transparent pb-16 px-1">
				<AnimatePresence mode="wait">
					<motion.div
						key={activePane}
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -10 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="h-full"
					>
						{renderContent()}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Status Footer */}
			<div className="absolute bottom-0 w-full border-t border-black/5 dark:border-white/5 bg-background/50 p-2 text-muted-foreground text-xs backdrop-blur-sm">
				<div className="flex items-center justify-between px-2">
					<div className="flex items-center gap-1.5">
						<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
						<span>AI Ready</span>
					</div>
					<span className="text-muted-foreground/70">
						Ask anything in chat →
					</span>
				</div>
			</div>
		</div>
	);
}
