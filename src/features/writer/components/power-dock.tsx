"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
	Clock,
	Copy,
	History as HistoryIcon,
	Home,
	MessageSquare,
	PanelRightClose,
	PanelRightOpen,
	Redo,
	Search,
	Send,
	Sparkles,
	Trash2,
	Undo,
	X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Separator } from "@/components/atoms/separator";
import { Textarea } from "@/components/atoms/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { GlassCard } from "@/components/molecules/glass-card";
import { usePowerDockHistory } from "@/features/writer/components/hooks/use-power-dock-history";
import { TOOLS } from "@/features/writer/components/tools/tool-config";
import {
	type ToolType,
	toolStrategies,
} from "@/features/writer/components/tools/tool-strategies";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useWriterControl } from "@/features/writer/components/writer-control-context";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { cn } from "@/lib/utils";

export function PowerDock() {
	const {
		editorActions,
		toggleChat,
		isChatOpen,
		toggleSpotlight,
		isSpotlightOpen,
	} = useWriterControl();

	const { project, structure, activeChapterId, activeSceneId, sceneContent } =
		useWriterContext();
	const { viewMode, toggleCanvas, isCanvasOpen, actions } = useWriterLayoutContext();
	const isZen = viewMode === "zen";

	// Hotkeys
	useHotkeys(
		"meta+\\",
		(e) => {
			e.preventDefault();
			toggleCanvas();
		},
		{
			description: "Toggle canvas",
		},
		[toggleCanvas],
	);

	// Dock States
	const [mode, setMode] = useState<"default" | "tools" | "input">("default");
	const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
	const [input, setInput] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	const { addToHistory, getToolHistory, clearToolHistory } =
		usePowerDockHistory();

	// Reset when closing or changing modes
	const reset = () => {
		setMode("default");
		setSelectedTool(null);
		setInput("");
		setResult(null);
		setIsProcessing(false);
	};

	const handleToolSelect = (toolId: string) => {
		setSelectedTool(toolId as ToolType);
		setMode("input");
		setResult(null);
	};

	const handleCopyScene = () => {
		if (sceneContent) {
			navigator.clipboard.writeText(sceneContent);
			toast.success("Scene copied to clipboard");
		}
	};

	const handleExecute = async () => {
		if (!project?.id || !selectedTool) return;
		setIsProcessing(true);
		setResult(null);

		const currentInput = input; // Capture input before potential reset

		try {
			const strategy = toolStrategies[selectedTool];
			if (!strategy) {
				toast.error("Tool not implemented yet.");
				return;
			}

			const toolContext = {
				project,
				structure: structure ?? [],
				activeChapterId: activeChapterId || null,
				activeSceneId: activeSceneId || null,
			};

			const outcome = await strategy.execute(toolContext, currentInput);

			if (outcome.success) {
				addToHistory(selectedTool, currentInput);
				if (outcome.result) {
					setResult(outcome.result);
					toast.success("Action completed");
				} else {
					// If no result text (e.g. direct edit), close the dock
					reset();
					toast.success("Action completed");
				}
			} else {
				toast.error("Operation failed. Please try again.");
			}
		} catch (e) {
			toast.error("Operation failed.");
			console.error(e);
		} finally {
			setIsProcessing(false);
		}
	};

	const getPlaceholder = (tool: ToolType) => {
		switch (tool) {
			case "write":
				return "Instructions (e.g., 'Make it tense')";
			case "rewrite":
				return "Instructions (e.g., 'Change to 1st person')";
			case "expand":
				return "Paste notes or outline...";
			case "critique":
				return "Specific questions? (Optional)";
			case "lore":
				return "Describe the entity...";
			case "search":
				return "What are you looking for?";
			default:
				return "Enter instructions...";
		}
	};

	// Animation variants
	const containerVariants: Variants = {
		hidden: { y: 100, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 300, damping: 30 },
		},
		zen: { y: 100, opacity: 0 },
	};

	return (
		<TooltipProvider>
			<motion.div
				className={cn(
					"fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2",
					"w-auto max-w-[90vw]",
				)}
				initial="hidden"
				animate={isZen ? "zen" : "visible"}
				variants={containerVariants}
			>
				{/* Result Popover (if any) */}
				<AnimatePresence>
					{result && (
						<motion.div
							initial={{ opacity: 0, y: 20, scale: 0.9 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.9 }}
							className="mb-2 w-[500px] max-w-full"
						>
							<GlassCard
								variant="liquid"
								className="p-4 rounded-xl border-white/20 relative"
							>
								<div className="flex justify-between items-center mb-2">
									<span className="text-xs font-bold uppercase text-muted-foreground">
										Result
									</span>
									<button
										type="button"
										onClick={() => setResult(null)}
										className="hover:bg-white/10 p-1 rounded"
									>
										<X className="w-3 h-3" />
									</button>
								</div>
								<div className="max-h-60 overflow-y-auto text-sm font-mono bg-black/20 p-2 rounded">
									{result}
								</div>
								<div className="mt-2 flex items-center justify-between gap-2">
									<button
										type="button"
										onClick={() => {
											if (editorActions?.insertText && result) {
												editorActions.insertText(result);
												reset();
												toast.success("Text inserted into editor");
											}
										}}
										className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
									>
										Insert into Editor
									</button>
									<button
										type="button"
										onClick={() => {
											if (result) {
												navigator.clipboard.writeText(result);
												toast.success("Copied to clipboard");
											}
										}}
										className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
									>
										Copy
									</button>
								</div>
							</GlassCard>
						</motion.div>
					)}
				</AnimatePresence>

				<GlassCard
					variant="liquid"
					className={cn(
						"rounded-2xl shadow-2xl border-white/20 backdrop-blur-xl transition-all duration-500 ease-spring overflow-hidden",
						// Dynamic sizing based on mode
						mode === "default" ? "p-2" : "p-3",
						"border-primary/10",
					)}
				>
					<div className="flex items-center gap-1">
						{/* MAIN BAR: Always Visible (unless in input mode) */}
						<AnimatePresence mode="popLayout">
							{mode !== "input" && (
								<motion.div
									className="flex items-center gap-1"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20, width: 0 }}
								>
									{/* Studio Navigation Group */}
									<ControlGroup>
										<ControlButton
											asChild
											label="All Projects"
											icon={Home}
											shortcut="Esc"
											onClick={() => {}}
										>
											<Link href="/projects" />
										</ControlButton>
									</ControlGroup>

									<Separator
										orientation="vertical"
										className="h-6 mx-1 bg-white/10"
									/>

									<ControlGroup>
										<ControlButton
											label="Undo"
											icon={Undo}
											onClick={() => editorActions?.undo()}
											disabled={!editorActions}
											shortcut="⌘Z"
										/>
										<ControlButton
											label="Redo"
											icon={Redo}
											onClick={() => editorActions?.redo()}
											disabled={!editorActions}
											shortcut="⌘⇧Z"
										/>
									</ControlGroup>

									<Separator
										orientation="vertical"
										className="h-6 mx-1 bg-white/10"
									/>

									<ControlGroup>
										<ControlButton
											label="Copy Scene"
											icon={Copy}
											onClick={handleCopyScene}
											disabled={!activeSceneId}
											shortcut="⌘C"
										/>
									</ControlGroup>

									<Separator
										orientation="vertical"
										className="h-6 mx-1 bg-white/10"
									/>

									<ControlGroup>
										<ControlButton
											label="Spotlight"
											icon={Search}
											onClick={toggleSpotlight}
											active={isSpotlightOpen}
											shortcut="⌘/"
										/>
										<ControlButton
											label="AI Tools"
											icon={Sparkles}
											onClick={() =>
												setMode(mode === "tools" ? "default" : "tools")
											}
											active={mode === "tools"}
											className={cn(
												mode === "tools" &&
													"bg-primary text-primary-foreground hover:bg-primary/90",
											)}
										/>
									</ControlGroup>

									<Separator
										orientation="vertical"
										className="h-6 mx-1 bg-white/10"
									/>

									<ControlGroup>
										<ControlButton
											label="Assistant"
											icon={MessageSquare}
											onClick={toggleChat}
											active={isChatOpen}
											shortcut="⌘Enter"
										/>
										<ControlButton
											label={isCanvasOpen ? "Close Canvas" : "Open Canvas"}
											icon={isCanvasOpen ? PanelRightClose : PanelRightOpen}
											onClick={toggleCanvas}
											active={isCanvasOpen}
											shortcut="⌘\"
											data-testid="canvas-toggle"
										/>
									</ControlGroup>
								</motion.div>
							)}
						</AnimatePresence>

						{/* AI TOOLS TRAY */}
						<AnimatePresence mode="popLayout">
							{mode === "tools" && (
								<motion.div
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									className="flex items-center gap-1 overflow-hidden pl-2 border-l border-white/10 ml-1"
								>
									{TOOLS.map((tool) => (
										<ControlButton
											key={tool.id}
											label={tool.label}
											icon={tool.icon}
											onClick={() => handleToolSelect(tool.id)}
											className={tool.color}
										/>
									))}
								</motion.div>
							)}
						</AnimatePresence>

						{/* INPUT MODE */}
						<AnimatePresence mode="popLayout">
							{mode === "input" && selectedTool && (
								<motion.div
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									className="flex items-center gap-2 px-1 min-w-[300px] md:min-w-[400px]"
								>
									<div className="flex items-center gap-2 mr-2 text-muted-foreground">
										<Sparkles className="w-4 h-4 text-primary" />
										<span className="text-xs font-bold uppercase">
											{TOOLS.find((t) => t.id === selectedTool)?.label}
										</span>
									</div>

									<div className="flex-1 relative group flex gap-2 items-start">
										<div className="relative flex-1">
											<Textarea
												value={input}
												onChange={(e) => setInput(e.target.value)}
												placeholder={getPlaceholder(selectedTool)}
												className="min-h-[36px] max-h-[100px] py-2 px-3 pr-10 resize-none bg-white/5 border-white/10 focus:border-primary/50 text-sm rounded-lg w-full"
												autoFocus
												onKeyDown={(e) => {
													if (e.key === "Enter" && !e.shiftKey) {
														e.preventDefault();
														handleExecute();
													}
													if (e.key === "Escape") {
														reset();
													}
												}}
											/>
											<button
												type="button"
												onClick={handleExecute}
												disabled={isProcessing}
												className="absolute right-1 top-1 p-1.5 hover:bg-primary rounded-md text-muted-foreground hover:text-primary-foreground transition-colors disabled:opacity-50"
											>
												{isProcessing ? (
													<span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin block" />
												) : (
													<Send className="w-3 h-3" />
												)}
											</button>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button
													type="button"
													aria-label="Command history"
													className={cn(
														"p-2 rounded-lg transition-colors border border-transparent",
														"hover:bg-white/10 text-muted-foreground hover:text-foreground",
														getToolHistory(selectedTool).length > 0 &&
															"text-primary/70 hover:text-primary hover:border-primary/20",
													)}
												>
													<HistoryIcon className="w-4 h-4" />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												side="top"
												className="w-64 max-h-60"
											>
												<DropdownMenuLabel className="flex items-center justify-between text-xs font-normal text-muted-foreground">
													<span>Recent {selectedTool} commands</span>
													<button
														type="button"
														aria-label="Clear history for this tool"
														onClick={() => clearToolHistory(selectedTool)}
														className="p-1 hover:text-destructive transition-colors"
														title="Clear history for this tool"
													>
														<Trash2 className="w-3 h-3" />
													</button>
												</DropdownMenuLabel>
												<DropdownMenuSeparator />
												{getToolHistory(selectedTool).length === 0 ? (
													<div className="p-2 text-xs text-muted-foreground text-center italic">
														No recent history
													</div>
												) : (
													getToolHistory(selectedTool).map((item, idx) => (
														<DropdownMenuItem
															key={`${item.timestamp}-${idx}`}
															onClick={() => setInput(item.input)}
															className="flex items-start gap-2 py-2 cursor-pointer"
														>
															<Clock className="w-3 h-3 mt-0.5 shrink-0 opacity-50" />
															<span className="line-clamp-2 text-xs">
																{item.input}
															</span>
														</DropdownMenuItem>
													))
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									<Separator
										orientation="vertical"
										className="h-6 mx-1 bg-white/10"
									/>

									<button
										type="button"
										aria-label="Close"
										onClick={reset}
										className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
									>
										<X className="w-4 h-4" />
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</GlassCard>
			</motion.div>
		</TooltipProvider>
	);
}

function ControlGroup({ children }: { children: React.ReactNode }) {
	return <div className="flex items-center gap-1">{children}</div>;
}

interface ControlButtonProps {
	label: string;
	icon: React.ElementType;
	onClick: () => void;
	active?: boolean;
	disabled?: boolean;
	shortcut?: string;
	className?: string;
	"data-testid"?: string;
	asChild?: boolean;
	children?: React.ReactNode;
}

function ControlButton({
	label,
	icon: Icon,
	onClick,
	active,
	disabled,
	shortcut,
	className,
	"data-testid": testId,
	asChild,
	children,
}: ControlButtonProps) {
	// If asChild is true, we clone the child element and pass props to it
	// This is a simplified version of Slot from Radix UI
	if (asChild && children) {
		const child = children as React.ReactElement<{
			className?: string;
			children?: React.ReactNode;
		}>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="relative">
						{/* We wrap in a div to handle tooltip ref forwarding cleanly if child is complex */}
						<child.type
							{...child.props}
							aria-label={label}
							className={cn(
								"relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
								"hover:bg-white/10 hover:scale-105 active:scale-95",
								active &&
									"bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]",
								disabled &&
									"opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
								!active &&
									!disabled &&
									"text-muted-foreground hover:text-foreground",
								className,
								child.props.className,
							)}
						>
							<Icon className="w-5 h-5" />
							{active && (
								<motion.div
									layoutId="active-dot"
									className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
								/>
							)}
							{/* Preserve original children of the passed element if any, though usually Link has none or text */}
							{child.props.children}
						</child.type>
					</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="flex items-center gap-2">
					<span>{label}</span>
					{shortcut && (
						<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-muted-foreground">
							{shortcut}
						</kbd>
					)}
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={label}
					onClick={onClick}
					disabled={disabled}
					data-testid={testId}
					className={cn(
						"relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
						"hover:bg-white/10 hover:scale-105 active:scale-95",
						active &&
							"bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]",
						disabled &&
							"opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
						!active &&
							!disabled &&
							"text-muted-foreground hover:text-foreground",
						className,
					)}
				>
					<Icon className="w-5 h-5" />
					{active && (
						<motion.div
							layoutId="active-dot"
							className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
						/>
					)}
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" className="flex items-center gap-2">
				<span>{label}</span>
				{shortcut && (
					<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-muted-foreground">
						{shortcut}
					</kbd>
				)}
			</TooltipContent>
		</Tooltip>
	);
}
