import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess } from "@/lib/db/queries/project";

export async function ensureProjectAccess(projectId: string, requireOwner = false) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const project = await getProjectByIdWithAccess({
    id: projectId,
    userId: session.user.id,
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  if (requireOwner && project.userId !== session.user.id) {
    throw new Error("Unauthorized: Owner access required");
  }

  return { project, user: session.user };
}
