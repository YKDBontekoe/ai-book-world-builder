"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
	generateSceneText,
	planChapterScenes,
} from "@/app/actions/story-generation";
import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
	type GenerationPhase,
	GenerationProgressDialog,
	type SceneProgress,
} from "@/features/writer/components/generation-progress-dialog";

interface ChapterActionsProps {
	chapterId: string;
	onUpdate: () => void;
	isReadOnly?: boolean;
}

export function ChapterActions({
	chapterId,
	onUpdate,
	isReadOnly,
}: ChapterActionsProps) {
	const [loading, setLoading] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [phase, setPhase] = useState<GenerationPhase>("planning");
	const [scenes, setScenes] = useState<SceneProgress[]>([]);
	const [error, setError] = useState<string | undefined>();
	const [cancelled, setCancelled] = useState(false);

	const resetState = useCallback(() => {
		setPhase("planning");
		setScenes([]);
		setError(undefined);
		setCancelled(false);
	}, []);

	const handleCancel = useCallback(() => {
		setCancelled(true);
	}, []);

	const handleGenerate = async () => {
		resetState();
		setLoading(true);
		setDialogOpen(true);
		setPhase("planning");

		try {
			// 1. Plan Structure
			const planResult = await planChapterScenes(chapterId);

			if (cancelled) {
				setDialogOpen(false);
				setLoading(false);
				return;
			}

			if (!planResult.success || !("data" in planResult)) {
				setPhase("error");
				setError(planResult.error || "Failed to plan scenes");
				setLoading(false);
				return;
			}

			if (!planResult.data.success || !planResult.data.sceneIds) {
				setPhase("error");
				setError("Failed to plan scenes");
				setLoading(false);
				return;
			}

			// Initialize scene progress with titles (we'll get titles from the response)
			const initialScenes: SceneProgress[] = planResult.data.sceneIds.map(
				(id: string, index: number) => ({
					id,
					title: `Scene ${index + 1}`,
					status: "pending" as const,
				}),
			);
			setScenes(initialScenes);
			setPhase("generating");

			onUpdate(); // Show empty scenes immediately

			// 2. Generate Content Sequentially
			const total = planResult.data.sceneIds.length;

			for (let i = 0; i < total; i++) {
				if (cancelled) {
					setDialogOpen(false);
					setLoading(false);
					return;
				}

				const sceneId = planResult.data.sceneIds[i];

				// Update scene status to generating
				setScenes((prev) =>
					prev.map((s, idx) =>
						idx === i ? { ...s, status: "generating" as const } : s,
					),
				);

				try {
					const result = await generateSceneText(sceneId);

					if (!result.success) {
						// Mark scene as error but continue with others
						console.error(`Failed to generate scene ${i + 1}:`, result.error);
						setScenes((prev) =>
							prev.map((s, idx) =>
								idx === i ? { ...s, status: "error" as const } : s,
							),
						);
					} else {
						// Update scene status to complete
						setScenes((prev) =>
							prev.map((s, idx) =>
								idx === i ? { ...s, status: "complete" as const } : s,
							),
						);
					}

					onUpdate(); // Update UI as scenes fill in
				} catch (_sceneError) {
					// Mark scene as error but continue with others
					setScenes((prev) =>
						prev.map((s, idx) =>
							idx === i ? { ...s, status: "error" as const } : s,
						),
					);
				}
			}

			setPhase("complete");
			toast.success("Chapter generation complete!");
		} catch (e) {
			setPhase("error");
			setError(
				e instanceof Error ? e.message : "An error occurred during generation",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDialogClose = (open: boolean) => {
		if (!open && (phase === "complete" || phase === "error")) {
			setDialogOpen(false);
			resetState();
		} else if (!open && loading) {
			// User trying to close during generation - confirm cancel
			handleCancel();
			setDialogOpen(false);
		} else {
			setDialogOpen(open);
		}
	};

	if (isReadOnly) return null;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-muted-foreground/60 hover:text-purple-600 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-all rounded-md"
						aria-label="Chapter Actions"
					>
						{loading ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<Sparkles className="h-3 w-3 text-purple-500" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleGenerate} disabled={loading}>
						<Sparkles className="mr-2 h-4 w-4" />
						Generate Scenes (AI)
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<GenerationProgressDialog
				open={dialogOpen}
				onOpenChange={handleDialogClose}
				phase={phase}
				scenes={scenes}
				error={error}
				onCancel={handleCancel}
			/>
		</>
	);
}
