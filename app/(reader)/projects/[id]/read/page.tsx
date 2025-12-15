import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
  getChaptersWithContent,
  getProjectByIdWithAccess,
} from "@/lib/db/queries";
import { ReaderView } from "@/components/reader/reader-view";

export const dynamic = "force-dynamic";

export default async function ReaderPage({
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
    redirect("/");
  }

  const chapters = await getChaptersWithContent({ projectId: project.id });

  return (
    <ReaderView
      project={project}
      chapters={chapters}
      userId={userId}
    />
  );
}
