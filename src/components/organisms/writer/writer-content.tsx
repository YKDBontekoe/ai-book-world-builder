"use client";

import { Lock, MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";
import { EmptyState } from "@/components/molecules/empty-state";
import {
	Editor,
	type EditorHandle,
} from "@/components/organisms/editor/text-editor";
import { StoryWizard } from "@/components/organisms/writer/story-wizard";
import { useAppearance } from "@/components/providers/appearance-provider";
import type { Entity } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

interface WriterContentProps {
	projectId: string;
	activeSceneId: string | null;
	sceneContent: string;
	previewContent: string | null;
	structure: ChapterWithScenes[];
	isReadOnly: boolean;
	isTimeTraveling: boolean;
	isTypewriterMode: boolean;
	entities?: Entity[];
	onSaveContent: (content: string, debounce: boolean) => void;
}

export const WriterContent = forwardRef<EditorHandle, WriterContentProps>(
	(
		{
			projectId,
			activeSceneId,
			sceneContent,
			previewContent,
			structure,
			isReadOnly,
			isTimeTraveling,
			isTypewriterMode,
			entities,
			onSaveContent,
		},
		ref,
	) => {
		const router = useRouter();
		const { editorFont, editorFontSize, editorLineHeight } = useAppearance();
		const hasStructure = structure && structure.length > 0;

		if (activeSceneId) {
			return (
				<div
					className="writer-instance max-w-3xl mx-auto min-h-full py-8 px-8 pb-32 transition-all duration-300"
					style={{
						fontFamily:
							editorFont === "mono"
								? "var(--font-mono)"
								: editorFont === "serif"
									? "serif"
									: "var(--font-sans)",
						fontSize: `${editorFontSize}px`,
						lineHeight: editorLineHeight,
					}}
				>
					<Editor
						ref={ref}
						key={activeSceneId} // Reset editor when scene changes
						content={previewContent ?? sceneContent}
						onSaveContent={onSaveContent}
						status="idle"
						isCurrentVersion={true}
						currentVersionIndex={0}
						suggestions={[]}
						readOnly={isReadOnly || isTimeTraveling}
						typewriterMode={isTypewriterMode && !isTimeTraveling}
						mentionables={entities || []}
					/>
				</div>
			);
		}

		if (!hasStructure) {
			if (isReadOnly) {
				return (
					<div className="flex h-full items-center justify-center p-8">
						<EmptyState
							data-testid="empty-state"
							title="Empty Project"
							description="This project has no content yet."
							icon={Lock}
							variant="dashed"
						/>
					</div>
				);
			}

			return (
				<StoryWizard projectId={projectId} onComplete={() => router.refresh()} />
			);
		}

		return (
			<div className="flex h-full items-center justify-center p-8">
				<EmptyState
					data-testid="empty-state"
					title="No Scene Selected"
					description="Select a scene from the sidebar to continue reading."
					icon={MousePointerClick}
					variant="dashed"
				/>
			</div>
		);
	},
);

WriterContent.displayName = "WriterContent";
