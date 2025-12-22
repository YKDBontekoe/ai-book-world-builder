import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
  getChaptersWithContent,
  getProjectByIdWithAccess,
} from "@/lib/db/queries";
import { getReadingProgress } from "@/lib/db/queries/reader";
import { ReaderView } from "@/components/organisms/reader/reader-view";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function ReaderContent({
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

  let initialProgress = null;
  if (userId) {
      initialProgress = await getReadingProgress({ projectId: project.id, userId });
  }

  return (
    <ReaderView
      project={project}
      chapters={chapters}
      userId={userId}
      initialProgress={initialProgress}
    />
  );
}

export default function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <ReaderContent params={params} />
    </Suspense>
  );
}
