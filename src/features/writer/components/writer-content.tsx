import { Lock, MousePointerClick } from "lucide-react";
import type { RefCallback } from "react";
import { EmptyState } from "@/components/molecules/empty-state";
import {
	Editor,
	type EditorHandle,
} from "@/components/organisms/editor/text-editor";
import { useAppearance } from "@/components/providers/appearance-provider";
import { StoryWizard } from "@/features/writer/components/story-wizard";
import type { Project } from "@/lib/db/schema";
import type { StructureItem } from "@/lib/services/schemas/story-schemas";

interface WriterContentProps {
	project: Project;
	activeSceneId: string | null;
	sceneContent: string;
	previewContent: string | null;
	onContentChange: (content: string, debounce: boolean) => void;
	structure: StructureItem[] | undefined;
	isReadOnly: boolean;
	isTimeTraveling: boolean;
	isTypewriterMode: boolean;
	entities: any[]; // Using any to avoid complex import for now, can be improved
	editorRef: RefCallback<EditorHandle | null>;
	onWizardComplete: () => void;
}

export function WriterContent({
	project,
	activeSceneId,
	sceneContent,
	previewContent,
	onContentChange,
	structure,
	isReadOnly,
	isTimeTraveling,
	isTypewriterMode,
	entities,
	editorRef,
	onWizardComplete,
}: WriterContentProps) {
	const { editorFont, editorFontSize, editorLineHeight } = useAppearance();
	const hasStructure = structure && structure.length > 0;

	if (activeSceneId) {
		return (
			<div
				className="writer-instance w-full min-h-full py-8 px-4 pb-32 transition-all duration-300"
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
					ref={editorRef}
					key={activeSceneId} // Reset editor when scene changes
					content={previewContent ?? sceneContent}
					onSaveContent={onContentChange}
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

		return <StoryWizard projectId={project.id} onComplete={onWizardComplete} />;
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
}
