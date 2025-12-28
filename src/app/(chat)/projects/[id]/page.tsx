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
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();
	const { id } = await params;

	const userId = session?.user?.id;

	const project = await getProjectByIdWithAccess({
		id,
		userId,
	});

	if (!project) {
		redirect("/projects");
	}

	const isReadOnly = project.userId !== userId;

	// Pre-fetch data for immediate rendering in parallel
	const [{ structure, structureText }, defaultModelId, availableModels] =
		await Promise.all([
			getProjectStructure(id),
			// Fetch preferred model for the assistant (using "middle" or "large" as default)
			getSelectedModelId("middle"),
			getAvailableModels(),
		]);

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
			/>
		</div>
	);
}
