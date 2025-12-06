import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess } from "@/lib/db/queries";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const project = await getProjectByIdWithAccess({
    id,
    userId: session.user?.id,
  });

  if (!project) {
    notFound();
  }

  const canEdit =
    session.user?.type === "regular" && project.userId === session.user.id;

  return (
    <div className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-2xl">{project.name}</h1>
            <Badge variant="secondary">{project.visibility}</Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground max-w-3xl">{project.description}</p>
          )}
          <p className="text-muted-foreground text-sm">
            {canEdit
              ? "You own this project."
              : "Viewing with read-only access."}
          </p>
        </div>
        <div className="text-muted-foreground text-sm text-right">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project folders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.folders.map((folder) => (
            <div className="space-y-2" key={folder.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium leading-tight">{folder.name}</p>
                  <p className="text-muted-foreground text-sm">{folder.description}</p>
                </div>
                <Badge variant="outline">{folder.slug}</Badge>
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
