import "server-only";

import { generateObject } from "ai";
import { z } from "zod";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getSelectedModelId } from "@/lib/ai/models";
import { openrouter } from "@/lib/ai/providers";
import { getEntitiesForProject, getScenesForProject } from "@/lib/db/queries";
import {
	buildExcerpt,
	type ManuscriptSceneMatch,
	rankScenesByQuery,
} from "@/lib/services/ai/manuscript-utils";

const manuscriptAnswerSchema = z.object({
	answer: z.string(),
	sources: z.array(
		z.object({
			type: z.enum(["scene", "entity"]),
			id: z.string(),
			title: z.string(),
			excerpt: z.string(),
		}),
	),
});

export interface ManuscriptAnswer {
	answer: string;
	sources: z.infer<typeof manuscriptAnswerSchema>["sources"];
}

const MAX_SCENE_EXCERPT = 320;
const MAX_ENTITY_EXCERPT = 220;
const MAX_SCENES = 4;
const MAX_ENTITIES = 4;

export const manuscriptService = {
	async askManuscript(
		projectId: string,
		question: string,
	): Promise<ManuscriptAnswer> {
		await ensureProjectAccess(projectId);

		const [scenes, entities] = await Promise.all([
			getScenesForProject({ projectId }),
			getEntitiesForProject({ projectId }),
		]);

		const rankedScenes = rankScenesByQuery(
			scenes.map<ManuscriptSceneMatch>((scene) => ({
				id: scene.id,
				title: scene.title,
				content: scene.content,
				updatedAt: scene.updatedAt,
			})),
			question,
		);

		const sceneMatches = rankedScenes
			.filter((scene) => scene.score > 0)
			.slice(0, MAX_SCENES);

		const fallbackScenes =
			sceneMatches.length > 0
				? sceneMatches
				: rankedScenes.slice(0, Math.min(MAX_SCENES, rankedScenes.length));

		const entityMatches = entities
			.filter(
				(entity) =>
					entity.name.toLowerCase().includes(question.toLowerCase()) ||
					entity.summary.toLowerCase().includes(question.toLowerCase()),
			)
			.slice(0, MAX_ENTITIES);

		const sceneContext = fallbackScenes
			.map(
				(scene) =>
					`[Scene:${scene.id}] ${scene.title}\n${buildExcerpt(
						scene.content ?? "",
						MAX_SCENE_EXCERPT,
					)}`,
			)
			.join("\n\n");

		const entityContext = entityMatches
			.map(
				(entity) =>
					`[Entity:${entity.id}] ${entity.name} (${entity.kind})\n${buildExcerpt(
						entity.summary,
						MAX_ENTITY_EXCERPT,
					)}`,
			)
			.join("\n\n");

		const prompt = `
You are an editorial assistant helping a novelist answer questions about their manuscript.
Answer the question using only the provided context. If the answer is not present, say so clearly.

Question: "${question}"

Scene Excerpts:
${sceneContext || "No scene excerpts available."}

Entity Notes:
${entityContext || "No entity notes available."}
`;

		const { object } = await generateObject({
			model: openrouter(await getSelectedModelId("large")),
			schema: manuscriptAnswerSchema,
			prompt,
		});

		return object;
	},
};
