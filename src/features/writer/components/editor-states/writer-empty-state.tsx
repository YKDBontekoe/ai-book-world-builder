"use client";

import { Lock, MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/molecules/empty-state";
import { StoryWizard } from "@/features/writer/components/story-wizard";

interface WriterEmptyStateProps {
	projectId: string;
	hasStructure: boolean;
	isReadOnly: boolean;
}

export function WriterEmptyState({
	projectId,
	hasStructure,
	isReadOnly,
}: WriterEmptyStateProps) {
	const router = useRouter();

	if (hasStructure) {
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
