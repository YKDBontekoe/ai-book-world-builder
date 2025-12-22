import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { WriterView } from "@/components/organisms/writer/writer-view";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import { getProjectStructure } from "@/app/actions/writer";
import { ChapterWithScenes } from "@/lib/types";

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

  // Pre-fetch structure for immediate rendering
  const { structure, structureText } = await getProjectStructure(id);

  const isReadOnly = project.userId !== userId;

  // The WriterView is now the main interface for a project
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] w-full">
        <WriterView
          project={project}
          initialStructure={structure as ChapterWithScenes[]}
          initialStructureText={structureText}
          isReadOnly={isReadOnly}
        />
    </div>
  );
}
