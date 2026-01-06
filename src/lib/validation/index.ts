/**
 * Validation Schemas
 *
 * Centralized Zod schemas for validating inputs to server actions and API routes.
 * Import these schemas and use them to validate user input before processing.
 */

import { z } from "zod";

// ============================================================================
// Common Patterns
// ============================================================================

/**
 * UUID validation with helpful error message
 */
export const uuidSchema = z.string().uuid({ message: "Invalid ID format" });

/**
 * Non-empty string validation
 */
export const nonEmptyString = z
	.string()
	.min(1, { message: "This field is required" });

/**
 * Visibility type for projects and other resources
 */
export const visibilitySchema = z.enum(["public", "private"], {
	errorMap: () => ({ message: "Visibility must be 'public' or 'private'" }),
});

// ============================================================================
// Project Schemas
// ============================================================================

export const createProjectSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Project name is required" })
		.max(100, { message: "Project name must be 100 characters or less" }),
	description: z
		.string()
		.max(500, { message: "Description must be 500 characters or less" })
		.optional(),
	visibility: visibilitySchema,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
	projectId: uuidSchema,
	name: z
		.string()
		.min(1, { message: "Project name is required" })
		.max(100, { message: "Project name must be 100 characters or less" })
		.optional(),
	description: z
		.string()
		.max(500, { message: "Description must be 500 characters or less" })
		.nullish(),
	visibility: visibilitySchema.optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const deleteProjectSchema = z.object({
	projectId: uuidSchema,
});

export const deleteProjectsSchema = z.object({
	projectIds: z.array(uuidSchema),
});

export const forkProjectSchema = z.object({
	projectId: uuidSchema,
	newName: z
		.string()
		.max(100, { message: "Project name must be 100 characters or less" })
		.optional(),
});

// ============================================================================
// Scene Schemas
// ============================================================================

/**
 * Shared validator for scene titles to ensure consistency.
 */
export const sceneTitleSchema = z
	.string()
	.min(1, { message: "Scene title is required" })
	.max(200, { message: "Scene title must be 200 characters or less" });

export const sceneIdSchema = z.object({
	sceneId: uuidSchema,
});

export const updateSceneContentSchema = z.object({
	sceneId: uuidSchema,
	content: z.string().max(200000, {
		message: "Scene content must be 200,000 characters or less",
	}),
});

export type UpdateSceneContentInput = z.infer<typeof updateSceneContentSchema>;

export const createSceneSchema = z.object({
	projectId: uuidSchema,
	chapterId: uuidSchema,
	title: sceneTitleSchema,
	sequence: z.number().int().positive(),
	content: z.string().optional(),
	status: z.enum(["planned", "drafting", "drafted", "revised"]).optional(),
});

export type CreateSceneInput = z.infer<typeof createSceneSchema>;

/**
 * Schema for updating a scene's title.
 */
export const updateSceneTitleSchema = z.object({
	sceneId: uuidSchema,
	title: sceneTitleSchema,
});

export type UpdateSceneTitleInput = z.infer<typeof updateSceneTitleSchema>;

/**
 * Schema for creating a new scene within a chapter.
 */
export const createSceneInChapterSchema = z.object({
	chapterId: uuidSchema,
	title: sceneTitleSchema,
	insertAfterSceneId: uuidSchema.optional(),
});

export type CreateSceneInChapterInput = z.infer<
	typeof createSceneInChapterSchema
>;

// ============================================================================
// Chapter Schemas
// ============================================================================

export const chapterIdSchema = z.object({
	chapterId: uuidSchema,
});

export const createChapterSchema = z.object({
	projectId: uuidSchema,
	volumeId: uuidSchema,
	outlineId: uuidSchema,
	title: z
		.string()
		.min(1, { message: "Chapter title is required" })
		.max(200, { message: "Chapter title must be 200 characters or less" }),
	sequence: z.number().int().positive(),
	notes: z.string().max(2000).optional(),
	status: z.enum(["planned", "drafting", "drafted", "revised"]).optional(),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;

export const updateChapterTitleSchema = z.object({
	chapterId: uuidSchema,
	title: z
		.string()
		.min(1, { message: "Chapter title is required" })
		.max(200, { message: "Chapter title must be 200 characters or less" }),
});

export const generateSceneSchema = z.object({
	chapterId: uuidSchema,
	prevSceneId: uuidSchema.optional(),
});

// ============================================================================
// Writer Schemas
// ============================================================================

export const projectIdSchema = z.object({
	projectId: uuidSchema,
});

export const saveProjectStructureSchema = z.object({
	projectId: uuidSchema,
	structureText: z.string(),
});

export const updateLastViewedSceneSchema = z.object({
	projectId: uuidSchema,
	sceneId: uuidSchema,
});

// ============================================================================
// Entity Schemas
// ============================================================================

export const entityKindSchema = z.enum([
	"Character",
	"Location",
	"Item",
	"Organization",
	"Event",
	"Concept",
	"Other",
]);

export const createEntitySchema = z.object({
	projectId: uuidSchema,
	name: z
		.string()
		.min(1, { message: "Entity name is required" })
		.max(200, { message: "Entity name must be 200 characters or less" }),
	kind: entityKindSchema,
	summary: z.string().max(2000).optional(),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;

// ============================================================================
// Model Preferences Schemas
// ============================================================================

export const modelRoleSchema = z.enum(["small", "middle", "large"], {
	errorMap: () => ({ message: "Invalid model role" }),
});

export const updateModelPreferenceSchema = z.object({
	role: modelRoleSchema,
	modelId: z.string().min(1, { message: "Model ID is required" }),
});

// ============================================================================
// Feedback Schemas
// ============================================================================

export const submitFeedbackSchema = z.object({
	messageId: uuidSchema.optional(),
	chatId: uuidSchema.optional(),
	feedbackType: z.enum(["positive", "negative"]),
	comment: z.string().max(1000).optional(),
	category: z.string().max(100).optional(),
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate input against a schema and return a Result type
 */
export function validateInput<T>(
	schema: z.ZodSchema<T>,
	input: unknown,
):
	| { success: true; data: T }
	| { success: false; error: string; details?: Record<string, string[]> } {
	const result = schema.safeParse(input);

	if (result.success) {
		return { success: true, data: result.data };
	}

	// Format error messages
	const details: Record<string, string[]> = {};
	for (const error of result.error.errors) {
		const path = error.path.join(".") || "_root";
		if (!details[path]) {
			details[path] = [];
		}
		details[path].push(error.message);
	}

	// Get first error for simple error message
	const firstError = result.error.errors[0];
	const errorMessage = firstError
		? `${firstError.path.join(".") || "Input"}: ${firstError.message}`
		: "Validation failed";

	return { success: false, error: errorMessage, details };
}

/**
 * Validate input and throw ValidationError if invalid
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, input: unknown): T {
	const result = schema.safeParse(input);

	if (result.success) {
		return result.data;
	}

	// Import dynamically to avoid circular dependency
	const { ValidationError } = require("@/lib/errors");
	throw ValidationError.fromZodError(result.error);
}
