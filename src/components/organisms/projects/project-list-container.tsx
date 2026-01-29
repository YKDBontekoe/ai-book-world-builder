import { ProjectBrowser } from "@/components/organisms/projects/project-browser";
import { ProjectEmptyState } from "@/components/organisms/projects/project-empty-state";
import { getProjectsVisibleToUser } from "@/lib/db/queries";

interface ProjectListContainerProps {
	userId: string;
	filter: "mine" | "shared";
}

export async function ProjectListContainer({
	userId,
	filter,
}: ProjectListContainerProps) {
	const projects = await getProjectsVisibleToUser({
		userId,
		filter,
	});

	if (projects.length === 0) {
		return <ProjectEmptyState filter={filter} />;
	}

	return <ProjectBrowser projects={projects} />;
}
