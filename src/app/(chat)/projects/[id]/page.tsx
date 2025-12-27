import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getAvailableModels } from "@/app/actions/settings";
import { getProjectStructure } from "@/app/actions/writer";
import { WriterView } from "@/components/organisms/writer/writer-view";
import { getSelectedModelId } from "@/lib/ai/models";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import type { ChapterWithScenes } from "@/lib/types";

export default async function ProjectPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const session = await auth();
	const { id } = await params;
	const { generation } = await searchParams;

	const userId = session?.user?.id;

	const project = await getProjectByIdWithAccess({
		id,
		userId,
	});

	if (!project) {
		redirect("/projects");
	}

	// Pre-fetch structure for immediate rendering
	const { structure, structureText } = await getProjectStructure(id);

	const isReadOnly = project.userId !== userId;

	// Fetch preferred model for the assistant (using "middle" or "large" as default)
	const defaultModelId = await getSelectedModelId("middle");
	const availableModels = await getAvailableModels();

	// The WriterView is now the main interface for a project
	return (
		<div className="h-[calc(100vh-theme(spacing.16))] w-full">
			<WriterView
				project={project}
				initialStructure={structure as ChapterWithScenes[]}
				initialStructureText={structureText}
				isReadOnly={isReadOnly}
				defaultModelId={defaultModelId}
				availableModels={availableModels}
				initialGenerationId={generation as string}
			/>
		</div>
	);
}
