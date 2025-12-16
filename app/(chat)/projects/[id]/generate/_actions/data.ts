"use server";

import { desc, eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import {
	bookGenerationAsset,
	bookGenerationStep,
	generationNote,
	generationTemplate,
	type GenerationSettings,
} from "@/lib/db/schema";
import { withGenerationAuth } from "./utils";

export async function addGenerationNote(
	generationId: string,
	content: string,
	chapterId?: string,
) {
	return withGenerationAuth(generationId, async (_userId) => {
		try {
			const [note] = await db
				.insert(generationNote)
				.values({
					generationId,
					chapterId: chapterId || null,
					content,
					isGlobal: !chapterId,
					createdAt: new Date(),
				})
				.returning();

			return { success: true, noteId: note.id };
		} catch (error) {
			return { error: "Failed to add note" };
		}
	});
}

export async function getGenerationStatus(generationId: string) {
	return withGenerationAuth(generationId, async (_userId, generation) => {
		try {
			const steps = await db
				.select()
				.from(bookGenerationStep)
				.where(eq(bookGenerationStep.generationId, generationId))
				.orderBy(bookGenerationStep.sequence);

			const assets = await db
				.select()
				.from(bookGenerationAsset)
				.where(eq(bookGenerationAsset.generationId, generationId));

			const notes = await db
				.select()
				.from(generationNote)
				.where(eq(generationNote.generationId, generationId))
				.orderBy(desc(generationNote.createdAt));

			return {
				generation,
				steps,
				assets,
				notes,
			};
		} catch (error) {
			return { error: "Failed to fetch generation status" };
		}
	});
}

export async function saveTemplate(
	name: string,
	description: string,
	settings: Partial<GenerationSettings>,
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [template] = await db
			.insert(generationTemplate)
			.values({
				name,
				description,
				settings: settings as any,
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return { success: true, templateId: template.id };
	} catch (error) {
		return { error: "Failed to save template" };
	}
}

export async function getTemplates() {
	const session = await auth();

	try {
		const templates = await db
			.select()
			.from(generationTemplate)
			.where(
				session?.user?.id ? undefined : eq(generationTemplate.isBuiltIn, true),
			);

		return { templates };
	} catch (error) {
		return { error: "Failed to fetch templates", templates: [] };
	}
}
