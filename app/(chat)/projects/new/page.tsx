import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectForm } from "./create-project-form";

export default async function NewProjectPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const canCreate = session.user?.type === "regular";

  if (!canCreate) {
    return (
      <PageContainer centered>
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Projects are limited to registered users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Sign in with a registered account to create and manage projects.
            Guests can still browse public projects.
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="items-center">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Create a project</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateProjectForm />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
