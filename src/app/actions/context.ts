"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db/drizzle";
import { projectRepository } from "@/lib/db/repositories";
import { type Entity, entity, scene, sceneCard } from "@/lib/db/schema";
import { NotFoundError } from "@/lib/errors";

// ============================================================================
// Types
// ============================================================================

export type ContextEntity = Entity & {
	matchType: "explicit" | "mentioned";
	relevance: string;
};

// ============================================================================
// Validation Schemas
// ============================================================================

const sceneContextSchema = z.object({
	sceneId: z.string().uuid("Invalid scene ID"),
	projectId: z.string().uuid("Invalid project ID"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get contextual entities for a scene
 */
export const getSceneContextAction = createUserAction({
	input: sceneContextSchema,
	handler: async ({ user, input }) => {
		// Verify project access
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		// 1. Fetch Scene and SceneCard
		const [sceneData] = await db
			.select()
			.from(scene)
			.where(eq(scene.id, input.sceneId))
			.limit(1);

		if (!sceneData) {
			throw NotFoundError.forResource("Scene", input.sceneId);
		}

		const [cardData] = await db
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.sceneId, input.sceneId))
			.limit(1);

		// 2. Fetch all project entities
		const allEntities = await db
			.select()
			.from(entity)
			.where(eq(entity.projectId, input.projectId));

		// 3. Match Entities
		const contextEntities: ContextEntity[] = [];
		const contentText = (sceneData.content || "").toLowerCase();
		const cardText = cardData
			? `${cardData.purpose} ${cardData.setting} ${cardData.atmosphere} ${cardData.plannedReveal || ""}`.toLowerCase()
			: "";

		// Check explicit character goals
		const explicitCharacters = new Set<string>();
		if (cardData?.characterGoals) {
			for (const name of Object.keys(cardData.characterGoals)) {
				explicitCharacters.add(name.toLowerCase());
			}
		}

		for (const ent of allEntities) {
			const nameLower = ent.name.toLowerCase();
			let isMatch = false;
			let matchType: "explicit" | "mentioned" = "mentioned";
			let relevance = "";

			// Check explicit tags (Goals)
			if (explicitCharacters.has(nameLower)) {
				isMatch = true;
				matchType = "explicit";
				relevance = "Has character goal";
			}
			// Check card metadata
			else if (cardText.includes(nameLower)) {
				isMatch = true;
				matchType = "explicit";
				relevance = "Referenced in scene plan";
			}
			// Check content
			else if (contentText.includes(nameLower)) {
				isMatch = true;
				matchType = "mentioned";
				relevance = "Mentioned in text";
			}

			if (isMatch) {
				contextEntities.push({
					...ent,
					matchType,
					relevance,
				});
			}
		}

		// Sort: Explicit first, then by name
		contextEntities.sort((a, b) => {
			if (a.matchType === "explicit" && b.matchType !== "explicit") return -1;
			if (a.matchType !== "explicit" && b.matchType === "explicit") return 1;
			return a.name.localeCompare(b.name);
		});

		return contextEntities;
	},
});
