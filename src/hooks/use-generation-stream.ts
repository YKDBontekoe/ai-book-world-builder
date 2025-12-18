"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GenerationStreamEvent {
	type:
		| "init"
		| "progress"
		| "step_start"
		| "step_complete"
		| "log"
		| "error"
		| "complete";
	data: {
		generationId?: string;
		status?: string;
		completedSteps?: number;
		totalSteps?: number;
		currentStep?: {
			id: string;
			type: string;
			chapterId?: string;
			sequence: number;
		} | null;
		message?: string;
	};
}

interface UseGenerationStreamOptions {
	generationId: string | null;
	onEvent?: (event: GenerationStreamEvent) => void;
	onComplete?: () => void;
	onError?: (message: string) => void;
}

export function useGenerationStream({
	generationId,
	onEvent,
	onComplete,
	onError,
}: UseGenerationStreamOptions) {
	const [isConnected, setIsConnected] = useState(false);
	const [status, setStatus] = useState<string>("idle");
	const [completedSteps, setCompletedSteps] = useState(0);
	const [totalSteps, setTotalSteps] = useState(0);
	const [currentStep, setCurrentStep] =
		useState<GenerationStreamEvent["data"]["currentStep"]>(null);
	const [logs, setLogs] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	const eventSourceRef = useRef<EventSource | null>(null);

	const connect = useCallback(() => {
		if (!generationId) return;

		// Clean up any existing connection
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		const eventSource = new EventSource(
			`/api/generations/${generationId}/stream`,
		);
		eventSourceRef.current = eventSource;

		eventSource.onopen = () => {
			setIsConnected(true);
			setError(null);
		};

		eventSource.onerror = () => {
			setIsConnected(false);
			setError("Connection lost, retrying...");
		};

		// Listen for all event types
		const handleEvent =
			(type: GenerationStreamEvent["type"]) => (event: MessageEvent) => {
				try {
					const data = JSON.parse(event.data);
					const streamEvent: GenerationStreamEvent = { type, data };

					// Update local state based on event type
					if (data.status) setStatus(data.status);
					if (data.completedSteps !== undefined)
						setCompletedSteps(data.completedSteps);
					if (data.totalSteps !== undefined) setTotalSteps(data.totalSteps);
					if (data.currentStep !== undefined) setCurrentStep(data.currentStep);
					if (data.message && type === "log") {
						setLogs((prev) => [...prev.slice(-99), data.message]);
					}

					// Callback
					onEvent?.(streamEvent);

					// Handle completion
					if (type === "complete") {
						onComplete?.();
						eventSource.close();
						eventSourceRef.current = null;
					}

					// Handle error
					if (type === "error") {
						setError(data.message || "Generation failed");
						onError?.(data.message || "Generation failed");
					}
				} catch (e) {
					console.error("Failed to parse SSE event:", e);
				}
			};

		eventSource.addEventListener("init", handleEvent("init"));
		eventSource.addEventListener("progress", handleEvent("progress"));
		eventSource.addEventListener("step_start", handleEvent("step_start"));
		eventSource.addEventListener("step_complete", handleEvent("step_complete"));
		eventSource.addEventListener("log", handleEvent("log"));
		eventSource.addEventListener("error", handleEvent("error"));
		eventSource.addEventListener("complete", handleEvent("complete"));

		return () => {
			eventSource.close();
			eventSourceRef.current = null;
		};
	}, [generationId, onEvent, onComplete, onError]);

	// Connect when generationId is available
	useEffect(() => {
		if (generationId) {
			const cleanup = connect();
			return cleanup;
		}
	}, [generationId, connect]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
		};
	}, []);

	return {
		isConnected,
		status,
		completedSteps,
		totalSteps,
		currentStep,
		logs,
		error,
		reconnect: connect,
	};
}
