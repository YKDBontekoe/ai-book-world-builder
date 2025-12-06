"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  createEntity,
  createEntityAttribute,
  createRelationship,
  getEntityById,
  getProjectByIdWithAccess,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

const entitySchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(2, "Entity name must be at least 2 characters."),
  kind: z.string().min(2, "Please provide an entity type."),
  summary: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const attributeSchema = z.object({
  projectId: z.string().uuid(),
  entityId: z.string().uuid(),
  name: z.string().min(2, "Attribute name must be at least 2 characters."),
  value: z.string().min(1, "Attribute value is required."),
  dataType: z
    .string()
    .min(2, "Select an attribute data type.")
    .max(48, "Data type is too long."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const relationshipSchema = z.object({
  projectId: z.string().uuid(),
  sourceEntityId: z.string().uuid(),
  targetEntityId: z.string().uuid(),
  type: z.string().min(2, "Relationship type must be at least 2 characters."),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type EntityActionState = {
  error?: string;
};

function formatZodErrors(errors: z.ZodIssue[]) {
  return errors.map((issue) => issue.message).join(" ");
}

async function requireProjectOwner(projectId: string, userId?: string) {
  const project = await getProjectByIdWithAccess({ id: projectId, userId });

  if (!project) {
    throw new ChatSDKError(
      "not_found:api",
      "Project not found or you do not have access."
    );
  }

  if (project.userId !== userId) {
    throw new ChatSDKError(
      "forbidden:api",
      "Only the project owner can update the schema."
    );
  }

  return project;
}

export async function createEntityAction(
  _prevState: EntityActionState,
  formData: FormData
): Promise<EntityActionState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const parsed = entitySchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    kind: formData.get("kind"),
    summary: formData.get("summary") ?? undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) {
    return { error: formatZodErrors(parsed.error.errors) };
  }

  try {
    const project = await requireProjectOwner(
      parsed.data.projectId,
      session.user?.id
    );
    const entity = await createEntity(parsed.data);

    revalidatePath(`/projects/${project.id}`);
    revalidatePath(`/projects/${project.id}/entities`);
    redirect(`/projects/${project.id}/entities/${entity.id}`);
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error: chatError?.message ?? "Unable to create the entity right now.",
    };
  }
}

export async function createAttributeAction(
  _prevState: EntityActionState,
  formData: FormData
): Promise<EntityActionState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const parsed = attributeSchema.safeParse({
    projectId: formData.get("projectId"),
    entityId: formData.get("entityId"),
    name: formData.get("name"),
    value: formData.get("value"),
    dataType: formData.get("dataType"),
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) {
    return { error: formatZodErrors(parsed.error.errors) };
  }

  try {
    const project = await requireProjectOwner(
      parsed.data.projectId,
      session.user?.id
    );

    const entity = await getEntityById({ id: parsed.data.entityId });

    if (!entity || entity.projectId !== project.id) {
      throw new ChatSDKError(
        "bad_request:api",
        "Entity not found in this project."
      );
    }

    await createEntityAttribute(parsed.data);

    revalidatePath(`/projects/${project.id}/entities/${entity.id}`);
    revalidatePath(`/projects/${project.id}`);
    return {};
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error:
        chatError?.message ?? "Unable to add the attribute. Please try again.",
    };
  }
}

export async function createRelationshipAction(
  _prevState: EntityActionState,
  formData: FormData
): Promise<EntityActionState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const parsed = relationshipSchema.safeParse({
    projectId: formData.get("projectId"),
    sourceEntityId: formData.get("sourceEntityId"),
    targetEntityId: formData.get("targetEntityId"),
    type: formData.get("type"),
    description: formData.get("description") ?? undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) {
    return { error: formatZodErrors(parsed.error.errors) };
  }

  try {
    const project = await requireProjectOwner(
      parsed.data.projectId,
      session.user?.id
    );

    await createRelationship(parsed.data);

    revalidatePath(
      `/projects/${project.id}/entities/${parsed.data.sourceEntityId}`
    );
    revalidatePath(`/projects/${project.id}`);
    revalidatePath(`/projects/${project.id}/entities`);
    return {};
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error:
        chatError?.message ?? "Unable to create the relationship right now.",
    };
  }
}
