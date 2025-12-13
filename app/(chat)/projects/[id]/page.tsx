import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ProjectOverview } from "@/components/project/project-overview";
import {
	getChaptersWithContent,
	getProjectByIdWithAccess,
} from "@/lib/db/queries";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();
	const { id } = await params;

	// Use userId if session exists, otherwise undefined (allowed for public projects)
	const userId = session?.user?.id;

	const project = await getProjectByIdWithAccess({
		id,
		userId,
	});

	if (!project) {
		redirect("/");
	}

	const chapters = await getChaptersWithContent({ projectId: project.id });

	// Determine ownership
	const isOwner = !!userId && project.userId === userId;

	return (
		<ProjectOverview
			project={project}
			isOwner={isOwner}
			chapters={chapters}
		/>
	);
}
