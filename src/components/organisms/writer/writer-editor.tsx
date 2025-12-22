"use client";

import { MousePointerClick, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/organisms/editor/text-editor";
import { EmptyState } from "@/components/molecules/empty-state";
import { StoryWizard } from "@/components/organisms/writer/story-wizard";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { WriterHeader } from "@/components/organisms/writer/writer-header";

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
                            readOnly={isReadOnly}
						/>
					</div>
				) : !hasStructure ? (
                    isReadOnly ? (
                        <div className="flex h-full items-center justify-center p-8">
                            <EmptyState
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
							title="No Scene Selected"
							description="Select a scene from the sidebar to continue reading."
							icon={MousePointerClick}
							variant="dashed"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
