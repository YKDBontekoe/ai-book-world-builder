import { useCallback, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

export interface HistorySnapshot {
	content: string;
	timestamp: number;
}

interface UseEditorHistoryProps {
	sceneId?: string;
	sceneContent: string;
	onRestore: (content: string) => void;
}

export interface UseEditorHistoryReturn {
	historyStack: HistorySnapshot[];
	isTimeTraveling: boolean;
	previewContent: string | null;
	sliderValue: number[];
	pushHistory: (content: string) => void;
	toggleTimeTravel: () => void;
	handleTimeTravel: (val: number[]) => void;
	cancelTimeTravel: () => void;
	restoreVersion: () => void;
}

export function useEditorHistory({
	sceneId,
	sceneContent,
	onRestore,
}: UseEditorHistoryProps): UseEditorHistoryReturn {
	const [historyStack, setHistoryStack] = useState<HistorySnapshot[]>([]);
	const [isTimeTraveling, setIsTimeTraveling] = useState(false);
	const [previewContent, setPreviewContent] = useState<string | null>(null);
	const [sliderValue, setSliderValue] = useState([0]);

	// Initialize history with initial content or reset on scene change
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset history only on scene switch
	useEffect(() => {
		if (sceneContent) {
			// If history is empty OR we switched scenes (implied by dependency on sceneId if we add it)
			// But wait, if we switch scenes, historyStack doesn't auto-reset unless we force it.
			// The previous logic only checked `historyStack.length === 0`.
			// We should reset if `sceneId` changes.
			setHistoryStack([{ content: sceneContent, timestamp: Date.now() }]);
			// Reset other state
			setIsTimeTraveling(false);
			setPreviewContent(null);
			setSliderValue([0]);
		}
	}, [sceneId]);

	// Initialize if empty (first load) - separate effect?
	// Actually the above effect handles "scene change".
	// But what if `sceneId` is undefined initially?
	// And what about `sceneContent` updates that are just typing? We don't want to reset history then.

	// Better approach:
	// 1. Reset history when `sceneId` changes.
	// 2. Push to history when `sceneContent` changes (debounced).

	// We need to be careful not to reset history just because `sceneContent` changed (typing).
	// So `sceneId` is the key.

	// Debounced history pusher
	const pushHistory = useDebounceCallback((content: string) => {
		if (!content) return;
		setHistoryStack((prev) => {
			// Avoid duplicates
			if (prev.length > 0 && prev[prev.length - 1].content === content)
				return prev;
			return [...prev, { content, timestamp: Date.now() }].slice(-50); // Keep last 50
		});
	}, 2000);

	const toggleTimeTravel = useCallback(() => {
		if (isTimeTraveling) {
			// Commit changes if needed? Or just exit.
			// If we want to restore to the previewed version:
			if (previewContent && previewContent !== sceneContent) {
				onRestore(previewContent);
			}
			setPreviewContent(null);
		} else {
			// Enter mode
			setSliderValue([historyStack.length - 1]);
		}
		setIsTimeTraveling((prev) => !prev);
	}, [
		isTimeTraveling,
		previewContent,
		sceneContent,
		onRestore,
		historyStack.length,
	]);

	const handleTimeTravel = useCallback(
		(val: number[]) => {
			const index = val[0];
			if (index >= 0 && index < historyStack.length) {
				const snapshot = historyStack[index];
				if (snapshot) {
					setPreviewContent(snapshot.content);
				}
				setSliderValue(val);
			}
		},
		[historyStack],
	);

	const cancelTimeTravel = useCallback(() => {
		setIsTimeTraveling(false);
		setPreviewContent(null);
	}, []);

	const restoreVersion = useCallback(() => {
		if (previewContent) {
			onRestore(previewContent);
		}
		setIsTimeTraveling(false);
		setPreviewContent(null);
	}, [previewContent, onRestore]);

	return {
		historyStack,
		isTimeTraveling,
		previewContent,
		sliderValue,
		pushHistory,
		toggleTimeTravel,
		handleTimeTravel,
		cancelTimeTravel,
		restoreVersion,
	};
}
