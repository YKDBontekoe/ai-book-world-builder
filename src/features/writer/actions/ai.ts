"use server";

import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { generationService } from "@/lib/ai/services";
import { checkUsageQuota } from "@/lib/quota";

// ============================================================================
// Schemas
// ============================================================================

const generationOptionsSchema = z.object({
	modelId: z.string().optional(),
	temperature: z.number().optional(),
	style: z.string().optional(),
});

const continueWritingSchema = z.object({
	context: z.string().max(100000, "Context too long"),
	previousContent: z.string().max(50000, "Previous content too long"),
	options: generationOptionsSchema.optional(),
});

const draftSceneSchema = z.object({
	sceneTitle: z.string().max(255, "Title too long"),
	cardData: z.object({
		purpose: z.string().max(5000, "Purpose too long"),
		setting: z.string().optional(),
		emotionalBeats: z.union([z.array(z.string()), z.string()]).optional(),
	}),
	instructions: z.string().optional(),
	options: generationOptionsSchema.optional(),
});

const generateIdeasSchema = z.object({
	context: z.string().max(100000, "Context too long"),
	currentText: z.string().max(50000, "Current text too long"),
	options: generationOptionsSchema.optional(),
});

const rewriteSelectionSchema = z.object({
	selection: z.string().max(20000, "Selection too long"),
	instruction: z.string().max(1000, "Instruction too long"),
	options: generationOptionsSchema.optional(),
});

const coAuthorAlternativesSchema = z.object({
	selection: z.string().max(20000, "Selection too long"),
	guidance: z.string().max(1000, "Guidance too long").optional(),
	options: generationOptionsSchema.optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Continues writing a story based on context and previous content.
 */
export const continueWriting = createUserAction({
	input: continueWritingSchema,
	handler: async ({ user, input }) => {
		if (!(await checkUsageQuota(user.id))) {
			throw new Error("Usage quota exceeded");
		}
		return generationService.continueWriting(
			input.context,
			input.previousContent,
			input.options,
		);
	},
});

/**
 * Drafts a scene from scratch using scene card details.
 */
export const draftScene = createUserAction({
	input: draftSceneSchema,
	handler: async ({ user, input }) => {
		if (!(await checkUsageQuota(user.id))) {
			throw new Error("Usage quota exceeded");
		}
		return generationService.draftScene(
			input.sceneTitle,
			input.cardData,
			input.instructions,
			input.options,
		);
	},
});

/**
 * Suggests plot developments.
 */
export const generateIdeas = createUserAction({
	input: generateIdeasSchema,
	handler: async ({ user, input }) => {
		if (!(await checkUsageQuota(user.id))) {
			throw new Error("Usage quota exceeded");
		}
		return generationService.generateIdeas(
			input.context,
			input.currentText,
			input.options,
		);
	},
});

/**
 * Rewrites a selected text.
 */
export const rewriteSelection = createUserAction({
	input: rewriteSelectionSchema,
	handler: async ({ user, input }) => {
		if (!(await checkUsageQuota(user.id))) {
			throw new Error("Usage quota exceeded");
		}
		return generationService.rewriteSelection(
			input.selection,
			input.instruction,
			input.options,
		);
	},
});

/**
 * Generates co-author alternatives for a selected text snippet.
 */
export const coAuthorAlternatives = createUserAction({
	input: coAuthorAlternativesSchema,
	handler: async ({ user, input }) => {
		if (!(await checkUsageQuota(user.id))) {
			throw new Error("Usage quota exceeded");
		}
		return generationService.coAuthorAlternatives(
			input.selection,
			input.guidance,
			input.options,
		);
	},
});
