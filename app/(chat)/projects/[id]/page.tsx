import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { WriterView } from "@/components/writer/writer-view";
import { getProjectByIdWithAccess } from "@/lib/db/queries";

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

  // The WriterView is now the main interface for a project
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] w-full">
        <WriterView project={project} />
    </div>
  );
}
