import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type HistoryItem,
	usePowerDockHistory,
} from "@/features/writer/components/hooks/use-power-dock-history";
import {
	type ToolType,
	toolStrategies,
} from "@/features/writer/components/tools/tool-strategies";
import { useWriterContent } from "@/features/writer/components/writer-content-context";
import { useWriterContext } from "@/features/writer/components/writer-context";

export type DockMode = "default" | "tools" | "input";

export interface UsePowerDockReturn {
	mode: DockMode;
	setMode: (mode: DockMode) => void;
	selectedTool: ToolType | null;
	input: string;
	setInput: (input: string) => void;
	isProcessing: boolean;
	result: string | null;
	setResult: (result: string | null) => void;
	reset: () => void;
	handleToolSelect: (toolId: ToolType) => Promise<void>;
	handleExecute: () => Promise<void>;
	getToolHistory: (tool: ToolType) => HistoryItem[];
	clearToolHistory: (tool: ToolType) => void;
	activeSceneId: string | null;
}

export function usePowerDock(): UsePowerDockReturn {
	const { project, structure, activeChapterId, activeSceneId } =
		useWriterContext();
	const { sceneContent } = useWriterContent();
	const { addToHistory, getToolHistory, clearToolHistory } =
		usePowerDockHistory();

	const [mode, setMode] = useState<DockMode>("default");
	const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
	const [input, setInput] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	const reset = useCallback(() => {
		setMode("default");
		setSelectedTool(null);
		setInput("");
		setResult(null);
		setIsProcessing(false);
	}, []);

	// Memoize tool context to ensure stability
	const toolContext = useMemo(
		() => ({
			project,
			structure: structure ?? [],
			activeChapterId: activeChapterId || null,
			activeSceneId: activeSceneId || null,
			sceneContent: sceneContent || null,
		}),
		[project, structure, activeChapterId, activeSceneId, sceneContent],
	);

	const handleToolSelect = useCallback(
		async (toolId: ToolType) => {
			if (toolId === "export") {
				try {
					await toolStrategies.export.execute(toolContext, "");
				} catch (error) {
					console.error("Export failed:", error);
					toast.error("Failed to export content");
				}
				return;
			}
			setSelectedTool(toolId);
			setMode("input");
			setResult(null);
		},
		[toolContext],
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
				toast.error("Action couldn't be completed. Please try again.");
			}
		} catch (e) {
			toast.error("Something went wrong. Please check your connection.");
			console.error(e);
		} finally {
			setIsProcessing(false);
		}
	}, [project, selectedTool, input, addToHistory, reset, toolContext]);

	return {
		mode,
		setMode,
		selectedTool,
		input,
		setInput,
		isProcessing,
		result,
		setResult,
		reset,
		handleToolSelect,
		handleExecute,
		getToolHistory,
		clearToolHistory,
		activeSceneId,
	};
}
