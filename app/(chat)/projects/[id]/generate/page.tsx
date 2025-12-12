import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
	getBookGenerationForProject,
	getProjectByIdWithAccess,
} from "@/lib/db/queries";
import { GenerationPageContent } from "./generation-page-content";

export default async function GeneratePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();
	const { id: projectId } = await params;

	if (!session?.user?.id) {
		redirect("/api/auth/guest");
	}

	const project = await getProjectByIdWithAccess({
		id: projectId,
		userId: session.user.id,
	});

	if (!project) {
		redirect("/");
	}

	const generation = await getBookGenerationForProject({ projectId });

	return (
		<GenerationPageContent
			project={project}
			initialGenerationId={generation?.id}
		/>
	);
}
