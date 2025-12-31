import type { Session } from "next-auth";
import { auth } from "@/app/(auth)/auth";
import { projectRepository } from "@/lib/db/repositories";
import type { Project } from "@/lib/db/schema";
import type { UserRole } from "@/lib/db/schema/auth";
import { userRole } from "@/lib/db/schema/auth";

export const isAdmin = (role?: UserRole | string | null) => {
	return role === "admin";
};

export async function authorizeProjectAccess(
	projectId: string,
	options: { requiresWrite?: boolean } = {},
): Promise<
	| { project: Project; session: Session }
	| { project?: undefined; session?: undefined; error: string }
> {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const project = await projectRepository.findByIdWithAccess(
		projectId,
		session.user.id,
	);

	if (!project) {
		return { error: "Project not found or access denied" };
	}

	if (options.requiresWrite && project.userId !== session.user.id) {
		return { error: "Write access required" };
	}

	return { project, session };
}
