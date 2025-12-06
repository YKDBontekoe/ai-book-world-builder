import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectsVisibleToUser } from "@/lib/db/queries";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const projects = await getProjectsVisibleToUser({
    userId: session.user?.id as string,
  });

  const canCreate = session.user?.type === "regular";

  return (
    <div className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Organize world building work across worlds, characters, and drafts.
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/projects/new">Create project</Link>
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No projects yet</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {canCreate
              ? "Start your first project to keep worlds, timelines, and drafts together."
              : "Sign in with a registered account to create and manage projects."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card className="transition hover:border-primary" key={project.id}>
              <Link
                className="flex h-full flex-col"
                href={`/projects/${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">
                      {project.name}
                    </CardTitle>
                    <Badge variant="secondary">{project.visibility}</Badge>
                  </div>
                  {project.description && (
                    <p className="line-clamp-2 text-muted-foreground text-sm">
                      {project.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="mt-auto text-muted-foreground text-sm">
                  <div className="flex items-center justify-between">
                    <span>{project.folders.length} folders</span>
                    <span>
                      {new Date(project.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
