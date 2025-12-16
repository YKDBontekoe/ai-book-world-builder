import {
	cancelGeneration,
	getGenerationStatus,
	pauseGeneration,
	resumeGeneration,
} from "@/app/(chat)/projects/[id]/generate/actions";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type StepStatus = "pending" | "running" | "completed" | "failed" | "paused";

export interface GenerationStep {
	id: string;
	sequence: number;
	stepType: string;
	status: StepStatus;
	chapterId?: string | null;
	wordCount?: number | null;
	agentOutput?: string | null;
	reviewFeedback?: string | null;
}

export interface GenerationAsset {
	id: string;
	assetType: string;
	content?: string | null;
}

export function useGenerationDashboard(
	projectId: string,
	generationId: string | null,
	onComplete?: () => void,
) {
	const [isLoading, setIsLoading] = useState(true);
	const [isPaused, setIsPaused] = useState(false);
	const [generationStatus, setGenerationStatus] = useState<string>("idle");
	const [steps, setSteps] = useState<GenerationStep[]>([]);
	const [assets, setAssets] = useState<GenerationAsset[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isExporting, setIsExporting] = useState(false);

	const fetchData = useCallback(async () => {
		if (!generationId) return;

		try {
			const result = await getGenerationStatus(generationId);
			if ("error" in result) {
				setError(result.error ?? "Unknown error");
				return;
			}

			if (result.generation) {
				setGenerationStatus(result.generation.status);
				setIsPaused(result.generation.status === "paused");

				if (result.generation.status === "completed") {
					onComplete?.();
				}
			}

			if (result.steps) {
				setSteps(
					result.steps.map((s) => ({
						id: s.id,
						sequence: s.sequence,
						stepType: s.stepType,
						status: s.status as StepStatus,
						chapterId: s.chapterId,
						wordCount: s.wordCount,
						agentOutput: s.agentOutput,
						reviewFeedback: s.reviewFeedback,
					})),
				);
			}

			if (result.assets) {
				setAssets(
					result.assets.map((a) => ({
						id: a.id,
						assetType: a.assetType,
						content: a.content,
					})),
				);
			}

			setIsLoading(false);
		} catch (_err) {
			setError("Failed to fetch generation status");
			setIsLoading(false);
		}
	}, [generationId, onComplete]);

	useEffect(() => {
		fetchData();

		const interval = setInterval(() => {
			if (generationStatus !== "completed" && generationStatus !== "failed") {
				fetchData();
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [fetchData, generationStatus]);

	const handlePause = async () => {
		if (!generationId) return;
		const result = await pauseGeneration(generationId);
		if ("success" in result && result.success) {
			setIsPaused(true);
			setGenerationStatus("paused");
		}
	};

	const handleResume = async () => {
		if (!generationId) return;
		const result = await resumeGeneration(generationId);
		if ("success" in result && result.success) {
			setIsPaused(false);
			setGenerationStatus("running");
		}
	};

	const handleCancel = async () => {
		if (!generationId) return;
		const result = await cancelGeneration(generationId);
		if ("success" in result && result.success) {
			setGenerationStatus("failed");
			await fetchData();
		}
	};

	const handleExport = async (format: "pdf" | "epub") => {
		if (!projectId) return;
		setIsExporting(true);
		try {
			const res = await fetch(`/api/projects/${projectId}/export`, {
				method: "POST",
				body: JSON.stringify({ format }),
				headers: { "Content-Type": "application/json" },
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			toast.success(
				`Export started! Check the Exports page for your ${format.toUpperCase()}.`,
			);
		} catch (err) {
			toast.error(
				`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
			);
		} finally {
			setIsExporting(false);
		}
	};

	return {
		isLoading,
		isPaused,
		generationStatus,
		steps,
		assets,
		error,
		isExporting,
		handlePause,
		handleResume,
		handleCancel,
		handleExport,
	};
}
