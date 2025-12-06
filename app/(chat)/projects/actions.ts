"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createProject } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  description: z.string().optional(),
  visibility: z.enum(["private", "public"]),
});

export type CreateProjectState = {
  error?: string;
};

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  if (session.user?.type !== "regular") {
    return {
      error: "Only registered users can create projects.",
    };
  }

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    visibility: (formData.get("visibility") as string) ?? "private",
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.errors.map((issue) => issue.message).join(" ") ||
        "Invalid project details.",
    };
  }

  try {
    const project = await createProject({
      ...parsed.data,
      userId: session.user?.id as string,
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);
    redirect(`/projects/${project.id}`);
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error: chatError?.message ?? "Unable to create the project right now.",
    };
  }
}
