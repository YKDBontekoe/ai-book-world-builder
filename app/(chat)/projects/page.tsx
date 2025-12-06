import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
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
    <PageContainer>
      <PageHeader
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/projects/new">Create project</Link>
            </Button>
          ) : undefined
        }
        description="Organize world building work across worlds, characters, and drafts."
        title="Projects"
      />

      {projects.length === 0 ? (
        <EmptyState
          description={
            canCreate
              ? "Start your first project to keep worlds, timelines, and drafts together."
              : "Sign in with a registered account to create and manage projects."
          }
          title="No projects yet"
        />
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
    </PageContainer>
  );
}
