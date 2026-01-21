import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usePowerDockHistory } from "@/features/writer/components/hooks/use-power-dock-history";
import {
	type ToolType,
	toolStrategies,
} from "@/features/writer/components/tools/tool-strategies";
import { useWriterContent } from "@/features/writer/components/writer-content-context";
import { useWriterContext } from "@/features/writer/components/writer-context";

export type DockMode = "default" | "tools" | "input";

export function usePowerDock() {
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

	const handleToolSelect = useCallback(
		(toolId: string) => {
			if (toolId === "export") {
				const toolContext = {
					project,
					structure: structure ?? [],
					activeChapterId: activeChapterId || null,
					activeSceneId: activeSceneId || null,
					sceneContent: sceneContent || null,
				};
				toolStrategies.export.execute(toolContext, "");
				return;
			}
			setSelectedTool(toolId as ToolType);
			setMode("input");
			setResult(null);
		},
		[project, structure, activeChapterId, activeSceneId, sceneContent],
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
				sceneContent: sceneContent || null,
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
				toast.error("Action couldn't be completed. Please try again.");
			}
		} catch (e) {
			toast.error("Something went wrong. Please check your connection.");
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
		sceneContent,
	]);

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
	};
}
