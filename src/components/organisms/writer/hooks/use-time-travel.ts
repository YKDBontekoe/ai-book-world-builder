"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

export interface HistorySnapshot {
	content: string;
	timestamp: number;
}

interface UseTimeTravelProps {
	initialContent: string | null;
	onContentChange: (content: string) => void;
}

export function useTimeTravel({ initialContent, onContentChange }: UseTimeTravelProps) {
	const [historyStack, setHistoryStack] = useState<HistorySnapshot[]>([]);
	const [isTimeTraveling, setIsTimeTraveling] = useState(false);
	const [previewContent, setPreviewContent] = useState<string | null>(null);
	const [sliderValue, setSliderValue] = useState([0]);

	// Initialize history with initial content
	useEffect(() => {
		if (initialContent && historyStack.length === 0) {
			setHistoryStack([{ content: initialContent, timestamp: Date.now() }]);
		}
	}, [initialContent, historyStack.length]);

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

	const handleContentUpdate = useCallback(
		(content: string) => {
			// Save external
			onContentChange(content);
			// Push history
			pushHistory(content);
		},
		[onContentChange, pushHistory],
	);

	const toggleTimeTravel = () => {
		if (isTimeTraveling) {
			// If we are exiting time travel, check if we need to restore
			if (previewContent && previewContent !== initialContent) {
				onContentChange(previewContent);
			}
			setPreviewContent(null);
		} else {
			// Enter mode: set slider to latest
			setSliderValue([historyStack.length - 1]);
		}
		setIsTimeTraveling(!isTimeTraveling);
	};

	const handleTimeTravelChange = (val: number[]) => {
		const index = val[0];
		const snapshot = historyStack[index];
		if (snapshot) {
			setPreviewContent(snapshot.content);
		}
		setSliderValue(val);
	};

    const restoreVersion = () => {
        if (previewContent) {
            onContentChange(previewContent);
        }
        setIsTimeTraveling(false);
        setPreviewContent(null);
    };

    const cancelTimeTravel = () => {
        setIsTimeTraveling(false);
        setPreviewContent(null);
    };

	return {
		historyStack,
		isTimeTraveling,
		previewContent,
		sliderValue,
        handleContentUpdate,
		toggleTimeTravel,
		handleTimeTravelChange,
        restoreVersion,
        cancelTimeTravel
	};
}
