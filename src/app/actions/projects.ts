"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { projectRepository } from "@/lib/db/repositories";
import { projectLifecycleService } from "@/lib/services/project-lifecycle";

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
		return { error: validation.error.message };
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
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}
	const userId = session.user.id;

	const validation = renameProjectSchema.safeParse({ name, description });
	if (!validation.success) {
		return { error: validation.error.message };
	}

	const existingProject = await projectRepository.findByIdWithAccess(
		projectId,
		userId,
	);

	if (!existingProject) {
		return { error: "Project not found or access denied" };
	}

	if (existingProject.userId !== userId) {
		return { error: "Only the project owner can rename it." };
	}

	try {
		await projectRepository.update(projectId, validation.data);

		revalidatePath("/projects");
		revalidatePath(`/projects/${projectId}`);
		return { success: true };
	} catch (error) {
		console.error("Rename project error:", error);
		return { error: "Failed to rename project" };
	}
}

export async function deleteProject(projectId: string) {
	return deleteProjects([projectId]);
}

export async function deleteProjects(projectIds: string[]) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const result = await projectLifecycleService.deleteProjects(
		projectIds,
		session.user.id,
	);

	if (result.success) {
		revalidatePath("/projects");
	}

	return result;
}

const forkProjectSchema = z.object({
	originalProjectId: z.string().uuid(),
	newName: z.string().max(100).optional(),
});

export async function forkProject(originalProjectId: string, newName?: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const validation = forkProjectSchema.safeParse({
		originalProjectId,
		newName,
	});
	if (!validation.success) {
		return { error: validation.error.message };
	}

	const result = await projectLifecycleService.forkProject(
		validation.data.originalProjectId,
		session.user.id,
		validation.data.newName,
	);

	if (result.success) {
		revalidatePath("/projects");
	}

	return result;
}
