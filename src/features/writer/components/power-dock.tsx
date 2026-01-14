"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
	Copy,
	Home,
	MessageSquare,
	PanelRightClose,
	PanelRightOpen,
	Redo,
	Search,
	Sparkles,
	Undo,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { memo, useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { Separator } from "@/components/atoms/separator";
import { TooltipProvider } from "@/components/atoms/tooltip";
import { GlassCard } from "@/components/molecules/glass-card";
import { usePowerDockHistory } from "@/features/writer/components/hooks/use-power-dock-history";
import {
	type ToolType,
	toolStrategies,
} from "@/features/writer/components/tools/tool-strategies";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useWriterControl } from "@/features/writer/components/writer-control-context";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { cn } from "@/lib/utils";
import { ControlButton, ControlGroup } from "./power-dock/control-button";
import { PowerDockInput } from "./power-dock/power-dock-input";
import { PowerDockResult } from "./power-dock/power-dock-result";
import { PowerDockTray } from "./power-dock/power-dock-tray";

export const PowerDock = memo(function PowerDock() {
	const {
		editorActions,
		toggleChat,
		isChatOpen,
		toggleSpotlight,
		isSpotlightOpen,
	} = useWriterControl();

	const { project, structure, activeChapterId, activeSceneId, sceneContent } =
		useWriterContext();
	const layoutContext = useWriterLayoutContext();
	const { viewMode, toggleCanvas, isCanvasOpen } = layoutContext;
	const isZen = viewMode === "zen";

	const { addToHistory, getToolHistory, clearToolHistory } =
		usePowerDockHistory();

	// Dock States
	const [mode, setMode] = useState<"default" | "tools" | "input">("default");
	const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
	const [input, setInput] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	// Reset when closing or changing modes
	const reset = useCallback(() => {
		setMode("default");
		setSelectedTool(null);
		setInput("");
		setResult(null);
		setIsProcessing(false);
	}, []);

	const handleToolSelect = useCallback((toolId: string) => {
		setSelectedTool(toolId as ToolType);
		setMode("input");
		setResult(null);
	}, []);

	const handleCopyScene = useCallback(async () => {
		if (sceneContent != null) {
			try {
				await navigator.clipboard.writeText(sceneContent);
				toast.success("Scene copied to clipboard");
			} catch (error) {
				console.error("Failed to copy scene:", error);
				toast.error("Failed to copy scene to clipboard");
			}
		}
	}, [sceneContent]);

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

	// Register Copy Scene Hotkey (Cmd+Shift+C)
	useHotkeys(
		"meta+shift+c, ctrl+shift+c",
		(e) => {
			e.preventDefault();
			handleCopyScene();
		},
		{ enableOnFormTags: true, description: "Copy Scene" },
		[handleCopyScene],
	);

	const handleExecute = useCallback(async () => {
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
	}, [
		project,
		selectedTool,
		input,
		structure,
		activeChapterId,
		activeSceneId,
		addToHistory,
		reset,
	]);

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

	const handleInsertResult = useCallback(() => {
		if (editorActions?.insertText && result) {
			editorActions.insertText(result);
			reset();
			toast.success("Text inserted into editor");
		}
	}, [editorActions, result, reset]);

	const handleCopyResult = useCallback(() => {
		if (result) {
			navigator.clipboard.writeText(result);
			toast.success("Copied to clipboard");
		}
	}, [result]);

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
				<PowerDockResult
					result={result}
					onClear={() => setResult(null)}
					onInsert={handleInsertResult}
					onCopy={handleCopyResult}
				/>

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
										>
											<Link href="/projects">
												<Home className="w-5 h-5" />
											</Link>
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
											shortcut="⌘⇧C"
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
						<PowerDockTray mode={mode} onSelectTool={handleToolSelect} />

						{/* INPUT MODE */}
						<PowerDockInput
							mode={mode}
							selectedTool={selectedTool}
							input={input}
							setInput={setInput}
							isProcessing={isProcessing}
							onExecute={handleExecute}
							onReset={reset}
							onClearHistory={clearToolHistory}
							getHistory={getToolHistory}
						/>
					</div>
				</GlassCard>
			</motion.div>
		</TooltipProvider>
	);
});
