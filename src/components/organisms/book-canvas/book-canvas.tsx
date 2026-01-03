"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ActivityIcon,
	BookOpenIcon,
	ChevronRightIcon,
	ClockIcon,
	FileTextIcon,
	HistoryIcon,
	LayoutIcon,
	LibraryIcon,
	type LucideIcon,
	MapIcon,
	NetworkIcon,
	SparklesIcon,
	TrendingUpIcon,
	XIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/atoms/button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import {
	type CanvasPane,
	useBookCanvas,
} from "@/components/organisms/book-canvas/book-canvas-context";
import { cn } from "@/lib/utils";

const LoadingPane = () => (
	<div className="flex h-full items-center justify-center">
		<LoadingSpinner />
	</div>
);

const BiblePane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/bible-pane").then(
			(mod) => mod.BiblePane,
		),
	{ loading: LoadingPane },
);
const ChangeLogPane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/changelog-pane").then(
			(mod) => mod.ChangeLogPane,
		),
	{ loading: LoadingPane },
);
const DiagnosticsPane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/diagnostics-pane").then(
			(mod) => mod.DiagnosticsPane,
		),
	{ loading: LoadingPane },
);
const DraftPane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/draft-pane").then(
			(mod) => mod.DraftPane,
		),
	{ loading: LoadingPane },
);
const OutlinePane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/outline-pane").then(
			(mod) => mod.OutlinePane,
		),
	{ loading: LoadingPane },
);
const ScenePane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/scene-pane").then(
			(mod) => mod.ScenePane,
		),
	{ loading: LoadingPane },
);
const NetworkPane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/network-pane").then(
			(mod) => mod.NetworkPane,
		),
	{ loading: LoadingPane },
);
const ArcPane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/arc-pane").then(
			(mod) => mod.ArcPane,
		),
	{ loading: LoadingPane },
);
const TimelinePane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/timeline-pane").then(
			(mod) => mod.TimelinePane,
		),
	{ loading: LoadingPane },
);
const ContextPane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/context-pane").then(
			(mod) => mod.ContextPane,
		),
	{ loading: LoadingPane },
);
const MapPane = dynamic(
	() =>
		import("@/components/organisms/book-canvas/panes/map-pane").then(
			(mod) => mod.MapPane,
		),
	{ loading: LoadingPane },
);

export function BookCanvas({
	variant = "sidebar",
	className,
}: {
	variant?: "sidebar" | "embedded";
	className?: string;
}) {
	const { isOpen, setIsOpen, activePane, setActivePane, overallStatus } =
		useBookCanvas();

	const renderContent = () => {
		switch (activePane) {
			case "outline":
				return <OutlinePane />;
			case "graph":
				return <NetworkPane />;
			case "arc":
				return <ArcPane />;
			case "timeline":
				return <TimelinePane />;
			case "context":
				return <ContextPane />;
			case "map":
				return <MapPane />;
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

	const tabs: { id: CanvasPane; label: string; icon: LucideIcon }[] = [
		{ id: "outline", label: "Outline", icon: LayoutIcon },
		{ id: "graph", label: "Graph", icon: NetworkIcon },
		{ id: "arc", label: "Arc", icon: TrendingUpIcon },
		{ id: "timeline", label: "Timeline", icon: ClockIcon },
		{ id: "context", label: "Context", icon: SparklesIcon },
		{ id: "map", label: "Map", icon: MapIcon },
		{ id: "scenes", label: "Scenes", icon: LibraryIcon },
		{ id: "draft", label: "Draft", icon: FileTextIcon },
		{ id: "diagnostics", label: "Readiness", icon: ActivityIcon },
		{ id: "bible", label: "Bible", icon: BookOpenIcon },
		{ id: "changes", label: "Log", icon: HistoryIcon },
	];

	// Collapsed state - show expand button (only if not embedded)
	if (!isOpen && variant !== "embedded") {
		return (
			<div className="hidden h-dvh w-12 flex-shrink-0 flex-col items-center border-l border-white/10 bg-glass py-4 md:flex z-50">
				<Button
					className="h-10 w-10 rounded-full bg-glass shadow-sm hover:scale-105 transition-all"
					onClick={() => setIsOpen(true)}
					size="icon"
					variant="ghost"
				>
					<ChevronRightIcon className="h-5 w-5 rotate-180 text-foreground/70" />
				</Button>
				<div className="mt-4 flex flex-1 flex-col items-center gap-3">
					{tabs.slice(0, 5).map((tab) => (
						<Button
							className={cn(
								"h-9 w-9 rounded-xl transition-all duration-300",
								activePane === tab.id
									? "bg-primary/10 text-primary shadow-sm scale-105"
									: "text-muted-foreground hover:text-foreground hover:bg-white/10",
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
				"flex flex-col flex-shrink-0 bg-background/50 backdrop-blur-xl",
				variant === "sidebar"
					? "fixed inset-0 z-50 h-dvh w-full md:static md:w-96 lg:w-[28rem] glass border-l border-glass-border shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] md:flex"
					: "h-full w-full",
				className,
			)}
		>
			{/* Header with gradient */}
			<div className="flex items-center justify-between border-b border-glass-border bg-transparent p-4 shrink-0">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 shadow-inner">
						<SparklesIcon className="h-4 w-4" />
					</div>
					<div>
						<h2 className="font-semibold text-sm tracking-tight">
							Book Canvas
						</h2>
						<span
							className={cn(
								"text-xs font-medium transition-colors",
								overallStatus === "running"
									? "text-blue-500 animate-pulse"
									: "text-muted-foreground",
							)}
						>
							{overallStatus === "running" ? "Generating..." : "Ready"}
						</span>
					</div>
				</div>
				{variant !== "embedded" && (
					<Button
						className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
						onClick={() => setIsOpen(false)}
						size="icon"
						variant="ghost"
					>
						<XIcon className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Tabs with Segmented Control styling */}
			<div className="px-4 py-3 shrink-0">
				<div className="flex overflow-x-auto rounded-lg bg-black/5 dark:bg-white/5 p-1 gap-1 scrollbar-hide">
					{tabs.map((tab) => {
						const isActive = activePane === tab.id;
						return (
							<button
								className={cn(
									"relative flex flex-1 flex-col items-center justify-center gap-1.5 rounded-md px-1 py-1.5 font-medium text-[11px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-w-[50px]",
									isActive
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground/80",
								)}
								key={tab.id}
								onClick={() => setActivePane(tab.id)}
								type="button"
							>
								{isActive && (
									<motion.div
										layoutId="activeTab"
										className="absolute inset-0 rounded-md bg-background shadow-sm dark:bg-zinc-800"
										transition={{ type: "spring", stiffness: 400, damping: 30 }}
									/>
								)}
								<span className="relative z-10 flex flex-col items-center gap-1">
									<tab.icon className="h-4 w-4" />
									<span className="leading-none tracking-tight whitespace-nowrap">
										{tab.label}
									</span>
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-y-auto bg-transparent px-2 pb-16 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-black/20 dark:hover:scrollbar-thumb-white/20">
				<AnimatePresence mode="wait">
					<motion.div
						key={activePane}
						initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
						animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
						exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
						transition={{ type: "spring", stiffness: 350, damping: 30 }}
						className="h-full"
					>
						{renderContent()}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Status Footer */}
			<div className="absolute bottom-0 w-full border-t border-glass-border bg-glass-surface p-2 text-muted-foreground text-xs backdrop-blur-md">
				<div className="flex items-center justify-between px-2">
					<div className="flex items-center gap-2">
						<div className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
						</div>
						<span className="font-medium opacity-80">AI Ready</span>
					</div>
					<span className="text-muted-foreground/60">
						Ask anything in chat →
					</span>
				</div>
			</div>
		</div>
	);
}
