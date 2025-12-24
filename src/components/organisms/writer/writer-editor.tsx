"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, Lock, MousePointerClick, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { Button } from "@/components/atoms/button";
import { Slider } from "@/components/atoms/slider";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import {
	Editor,
	type EditorHandle,
} from "@/components/organisms/editor/text-editor";
import { DirectorDashboard } from "@/components/organisms/writer/dashboard/director-dashboard";
import { StoryWizard } from "@/components/organisms/writer/story-wizard";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { WriterHeader } from "@/components/organisms/writer/writer-header";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
import { useProjectEntities } from "@/hooks/use-project-entities";

interface HistorySnapshot {
	content: string;
	timestamp: number;
}

export function WriterEditor() {
	const router = useRouter();
	const {
		project,
		activeSceneId,
		sceneContent,
		handleContentChange,
		structure,
		isReadOnly,
	} = useWriterContext();

	const { isTypewriterMode, isDirectorMode, toggleDirectorMode } =
		useWriterLayoutContext();
	const { registerEditorActions } = useWriterControl();
	const { data: entities } = useProjectEntities(project.id);
	const editorRef = useRef<EditorHandle>(null);

	const hasStructure = structure && structure.length > 0;

	// Time Travel State
	const [historyStack, setHistoryStack] = useState<HistorySnapshot[]>([]);
	const [isTimeTraveling, setIsTimeTraveling] = useState(false);
	const [previewContent, setPreviewContent] = useState<string | null>(null);
	const [sliderValue, setSliderValue] = useState([0]);

	// Register Editor Actions (Undo/Redo)
	useEffect(() => {
		if (editorRef.current) {
			registerEditorActions({
				undo: () => editorRef.current?.undo(),
				redo: () => editorRef.current?.redo(),
			});
		}
	}, [registerEditorActions, activeSceneId]); // Re-register when scene changes

	// Initialize history with initial content
	useEffect(() => {
		if (sceneContent && historyStack.length === 0) {
			setHistoryStack([{ content: sceneContent, timestamp: Date.now() }]);
		}
	}, [sceneContent]);

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

	const onEditorContentChange = useCallback(
		(content: string, debounce: boolean) => {
			// Standard save
			handleContentChange(content);
			// History push
			pushHistory(content);
		},
		[handleContentChange, pushHistory],
	);

	const toggleTimeTravel = () => {
		if (isTimeTraveling) {
			// Commit changes if needed? Or just exit.
			// If we want to restore to the previewed version:
			if (previewContent && previewContent !== sceneContent) {
				handleContentChange(previewContent);
			}
			setPreviewContent(null);
		} else {
			// Enter mode
			setSliderValue([historyStack.length - 1]);
		}
		setIsTimeTraveling(!isTimeTraveling);
	};

	const handleTimeTravel = (val: number[]) => {
		const index = val[0];
		const snapshot = historyStack[index];
		if (snapshot) {
			setPreviewContent(snapshot.content);
		}
		setSliderValue(val);
	};

	// Narrative Intelligence Hook
	const narrativeMetrics = useNarrativeIntelligence({
		content: previewContent ?? sceneContent,
		entities: entities || [],
	});

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
			<WriterHeader />

			<div className="flex-1 overflow-y-auto relative scroll-smooth">
				{activeSceneId ? (
					<div className="max-w-3xl mx-auto min-h-full py-8 px-8 pb-32">
						<Editor
							ref={editorRef}
							key={activeSceneId} // Reset editor when scene changes
							content={previewContent ?? sceneContent}
							onSaveContent={onEditorContentChange}
							status="idle"
							isCurrentVersion={true}
							currentVersionIndex={0}
							suggestions={[]}
							readOnly={isReadOnly || isTimeTraveling}
							typewriterMode={isTypewriterMode && !isTimeTraveling}
							mentionables={entities || []}
						/>
					</div>
				) : !hasStructure ? (
					isReadOnly ? (
						<div className="flex h-full items-center justify-center p-8">
							<EmptyState
								data-testid="empty-state"
								title="Empty Project"
								description="This project has no content yet."
								icon={Lock}
								variant="dashed"
							/>
						</div>
					) : (
						<StoryWizard
							projectId={project.id}
							onComplete={() => router.refresh()}
						/>
					)
				) : (
					<div className="flex h-full items-center justify-center p-8">
						<EmptyState
							data-testid="empty-state"
							title="No Scene Selected"
							description="Select a scene from the sidebar to continue reading."
							icon={MousePointerClick}
							variant="dashed"
						/>
					</div>
				)}
			</div>

			{/* Director Dashboard Overlay */}
			<AnimatePresence>
				{isDirectorMode && (
					<DirectorDashboard
						metrics={narrativeMetrics}
						isVisible={true}
						onClose={toggleDirectorMode}
					/>
				)}
			</AnimatePresence>

			{/* Time Travel Controls */}
			{activeSceneId && historyStack.length > 1 && (
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
					<AnimatePresence>
						{isTimeTraveling ? (
							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 20, opacity: 0 }}
							>
								<GlassCard variant="liquid" className="p-4 flex flex-col gap-4">
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span>Original</span>
										<span className="font-bold text-primary">
											Now Previewing
										</span>
										<span>Current</span>
									</div>
									<Slider
										value={sliderValue}
										min={0}
										max={historyStack.length - 1}
										step={1}
										onValueChange={handleTimeTravel}
										className="py-2"
									/>
									<div className="flex justify-end gap-2">
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												setIsTimeTraveling(false);
												setPreviewContent(null);
											}}
										>
											Cancel
										</Button>
										<Button
											size="sm"
											onClick={() => {
												if (previewContent) {
													handleContentChange(previewContent);
													// Reset stack head? Maybe complex.
													// For now, it just adds a new entry on next save.
												}
												setIsTimeTraveling(false);
												setPreviewContent(null);
											}}
										>
											Restore Version
										</Button>
									</div>
								</GlassCard>
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								whileHover={{ scale: 1.05 }}
							>
								<Button
									variant="outline"
									size="sm"
									className="bg-background/50 backdrop-blur-sm shadow-lg rounded-full px-4 gap-2 border-primary/20 hover:border-primary/50"
									onClick={toggleTimeTravel}
								>
									<RotateCcw className="h-3.5 w-3.5" />
									<span className="text-xs">Time Travel</span>
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
}
