"use client";

import { MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";
import { Editor } from "../editor/text-editor";
import { EmptyState } from "../ui/empty-state";
import { StoryWizard } from "./story-wizard";
import { useWriterContext } from "./writer-context";
import { WriterHeader } from "./writer-header";

export function WriterEditor() {
	const router = useRouter();
	const {
		project,
		activeSceneId,
		sceneContent,
		handleContentChange,
		structure,
	} = useWriterContext();

	const hasStructure = structure && structure.length > 0;

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background/50">
			<WriterHeader />

			<div className="flex-1 overflow-y-auto relative">
				{activeSceneId ? (
					<div className="max-w-3xl mx-auto min-h-full py-8 px-8">
						<Editor
							key={activeSceneId}
							content={sceneContent}
							onSaveContent={handleContentChange}
							status="idle"
							isCurrentVersion={true}
							currentVersionIndex={0}
							suggestions={[]}
						/>
					</div>
				) : !hasStructure ? (
					<StoryWizard
						projectId={project.id}
						onComplete={() => router.refresh()}
					/>
				) : (
					<div className="flex h-full items-center justify-center p-8">
						<EmptyState
							title="No Scene Selected"
							description="Select a scene from the sidebar to continue writing."
							icon={MousePointerClick}
							variant="dashed"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
