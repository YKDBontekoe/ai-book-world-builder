"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { projectRepository, storyRepository } from "@/lib/db/repositories";
import { projectService } from "@/lib/services/project-service";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import { deleteProjectsSchema } from "@/lib/validation";

// Validation Schemas
const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
	visibility: z.enum(["private", "public"]),
	templateId: z.string().optional(),
});

const renameProjectSchema = z.object({
	projectId: z.string().uuid(),
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
});

export const createProjectAction = createUserAction({
	input: createProjectSchema,
	handler: async ({ input, user }) => {
		const newProject = await projectRepository.create({
			...input,
			userId: user.id,
		});

		if (input.templateId) {
			const template = PROJECT_TEMPLATES.find((t) => t.id === input.templateId);
			if (template && template.id !== "blank") {
				try {
					await storyRepository.createBookFromPlan(
						newProject.id,
						template.plan,
					);
				} catch (templateError) {
					console.error("Failed to apply template:", templateError);
				}
			}
		}

		revalidatePath("/projects");
		return { projectId: newProject.id };
	},
});

export const renameProject = createUserAction({
	input: renameProjectSchema,
	handler: async ({ input }) => {
		const { projectId, name, description } = input;

		// Ensure ownership (write access)
		await ensureProjectAccess(projectId, true);

		await projectRepository.update(projectId, { name, description });

		revalidatePath("/projects");
		revalidatePath(`/projects/${projectId}`);
	},
});

export const deleteProject = createUserAction({
	input: z.object({ projectId: z.string().uuid() }),
	handler: async ({ input, user }) => {
		const result = await projectService.deleteProjects(
			[input.projectId],
			user.id,
		);

		if (result.error) {
			throw new Error(result.error);
		}

		revalidatePath("/projects");
	},
});

export const deleteProjects = createUserAction({
	input: deleteProjectsSchema,
	handler: async ({ input, user }) => {
		const result = await projectService.deleteProjects(
			input.projectIds,
			user.id,
		);

		if (result.error) {
			throw new Error(result.error);
		}

		revalidatePath("/projects");
	},
});

export const forkProject = createUserAction({
	input: z.object({
		originalProjectId: z.string().uuid(),
		newName: z.string().optional(),
	}),
	handler: async ({ input, user }) => {
		const result = await projectService.forkProject(
			input.originalProjectId,
			user.id,
			input.newName,
		);

		if ('error' in result && result.error) {
			throw new Error(result.error);
		}

		revalidatePath("/projects");
		// forkProject returns { success: true, projectId: ... } or { error }
		// We want to return the data part if it exists
		if ('projectId' in result) {
			return { projectId: result.projectId };
		}
		return result;
	},
});
