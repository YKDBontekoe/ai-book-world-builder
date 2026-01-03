"use server";

import { eq } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db/drizzle";
import { type Entity, entity, scene, sceneCard } from "@/lib/db/schema";

export type ContextEntity = Entity & {
	matchType: "explicit" | "mentioned";
	relevance: string;
};

export async function getSceneContextAction(
	sceneId: string,
	projectId: string,
): Promise<{ success: boolean; data?: ContextEntity[]; error?: string }> {
	try {
		await ensureProjectAccess(projectId, false);

		// 1. Fetch Scene and SceneCard
		const [sceneData] = await db
			.select()
			.from(scene)
			.where(eq(scene.id, sceneId))
			.limit(1);

		if (!sceneData) {
			return { success: false, error: "Scene not found" };
		}

		const [cardData] = await db
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.sceneId, sceneId))
			.limit(1);

		// 2. Fetch all project entities
		const allEntities = await db
			.select()
			.from(entity)
			.where(eq(entity.projectId, projectId));

		// 3. Match Entities
		const contextEntities: ContextEntity[] = [];
		const contentText = (sceneData.content || "").toLowerCase();
		const cardText = cardData
			? `${cardData.purpose} ${cardData.setting} ${cardData.atmosphere} ${cardData.plannedReveal || ""}`.toLowerCase()
			: "";

		// Check explicit character goals
		const explicitCharacters = new Set<string>();
		if (cardData?.characterGoals) {
			Object.keys(cardData.characterGoals).forEach((name) => {
				explicitCharacters.add(name.toLowerCase());
			});
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

		return { success: true, data: contextEntities };
	} catch (error) {
		console.error("Failed to get scene context:", error);
		return { success: false, error: "Failed to fetch context" };
	}
}
