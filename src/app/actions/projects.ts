"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { withProjectWriteAccess } from "@/lib/actions-utils";
import { projectRepository } from "@/lib/db/repositories";
import { projectService } from "@/lib/services/project-service";
import { deleteProjectsSchema } from "@/lib/validation";

// Validation Schemas
const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
	visibility: z.enum(["private", "public"]),
});

const renameProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
});

export async function createProjectAction(params: {
	name: string;
	description?: string;
	visibility: VisibilityType;
}) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const validation = createProjectSchema.safeParse(params);
	if (!validation.success) {
		return { error: validation.error.errors[0].message };
	}

	try {
		const newProject = await projectRepository.create({
			...validation.data,
			userId: session.user.id,
		});

		revalidatePath("/projects");
		return { success: true, projectId: newProject.id };
	} catch (error) {
		console.error("Create project error:", error);
		return { error: "Failed to create project" };
	}
}

export async function renameProject(
	projectId: string,
	name: string,
	description?: string,
) {
	const validation = renameProjectSchema.safeParse({ name, description });
	if (!validation.success) {
		return { error: validation.error.errors[0].message };
	}

	const result = await withProjectWriteAccess(projectId, async () => {
		await projectRepository.update(projectId, validation.data);

		revalidatePath("/projects");
		revalidatePath(`/projects/${projectId}`);
		return { success: true };
	});

	if (!result.success) {
		return { error: result.error };
	}

	return result.data;
}

export async function deleteProject(projectId: string) {
	return deleteProjects([projectId]);
}

export async function deleteProjects(projectIds: string[]) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const validation = deleteProjectsSchema.safeParse({ projectIds });
	if (!validation.success) {
		return { error: validation.error.errors[0].message };
	}

	const result = await projectService.deleteProjects(
		validation.data.projectIds,
		session.user.id,
	);

	if ("success" in result && result.success) {
		revalidatePath("/projects");
		for (const projectId of result.deletedProjectIds) {
			revalidatePath(`/projects/${projectId}`);
		}
	}

	return result;
}

export async function forkProject(originalProjectId: string, newName?: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	// Validate originalProjectId is a valid UUID
	const idSchema = z.string().uuid();
	const validation = idSchema.safeParse(originalProjectId);
	if (!validation.success) {
		return { error: "Invalid project id" };
	}

	const result = await projectService.forkProject(
		originalProjectId,
		session.user.id,
		newName,
	);

	if ("success" in result && result.success) {
		revalidatePath("/projects");
	}

	return result;
}
