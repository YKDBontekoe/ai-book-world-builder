import { useCallback, useEffect, useRef, useState } from "react";
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
	const prevSceneRef = useRef<string | undefined>(sceneId);
	const [isTimeTraveling, setIsTimeTraveling] = useState(false);
	const [previewContent, setPreviewContent] = useState<string | null>(null);
	const [sliderValue, setSliderValue] = useState([0]);

	// Initialize history with initial content or reset on scene change
	useEffect(() => {
		const sceneChanged = prevSceneRef.current !== sceneId;
		prevSceneRef.current = sceneId;

		if (sceneContent && sceneChanged) {
			setHistoryStack([{ content: sceneContent, timestamp: Date.now() }]);
			// Reset other state
			setIsTimeTraveling(false);
			setPreviewContent(null);
			setSliderValue([0]);
		} else if (sceneContent && historyStack.length === 0) {
			// Initial load case
			setHistoryStack([{ content: sceneContent, timestamp: Date.now() }]);
		}
	}, [sceneId, sceneContent, historyStack.length]);

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
