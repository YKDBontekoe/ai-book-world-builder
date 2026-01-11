import { useLocalStorage } from "usehooks-ts";
import type { ToolType } from "@/features/writer/components/tools/tool-strategies";

export type HistoryItem = {
	toolId: ToolType;
	input: string;
	timestamp: number;
};

export function usePowerDockHistory() {
	const [history, setHistory] = useLocalStorage<HistoryItem[]>(
		"power-dock-history",
		[],
	);

	const addToHistory = (toolId: ToolType, text: string) => {
		setHistory((prev) => {
			// Remove identical recent entry to avoid clutter
			const filtered = prev.filter(
				(item) => !(item.toolId === toolId && item.input === text),
			);
			// Add new item to top, keep max 20
			return [
				{ toolId, input: text, timestamp: Date.now() },
				...filtered,
			].slice(0, 20);
		});
	};

	const getToolHistory = (toolId: ToolType) => {
		return history.filter((h) => h.toolId === toolId);
	};

	const clearToolHistory = (toolId: ToolType) => {
		setHistory((prev) => prev.filter((h) => h.toolId !== toolId));
	};

	return {
		history,
		addToHistory,
		getToolHistory,
		clearToolHistory,
	};
}
