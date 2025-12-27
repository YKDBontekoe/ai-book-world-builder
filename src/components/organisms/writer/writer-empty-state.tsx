"use client";

import { Lock, MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/molecules/empty-state";
import { StoryWizard } from "@/components/organisms/writer/story-wizard";

interface WriterEmptyStateProps {
	activeSceneId: string | null;
	hasStructure: boolean;
	isReadOnly: boolean;
	projectId: string;
}

export function WriterEmptyState({
	activeSceneId,
	hasStructure,
	isReadOnly,
	projectId,
}: WriterEmptyStateProps) {
	const router = useRouter();

	if (activeSceneId) return null; // Should not render if scene is active

	// Case 1: No structure at all (New Project)
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

	// Case 2: Structure exists, but no scene selected
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
