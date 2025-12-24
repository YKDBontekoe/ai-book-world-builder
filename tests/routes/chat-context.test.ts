import { expect, test } from "@playwright/test";

import { DEFAULT_PROJECT_FOLDERS } from "@/lib/constants";
import { buildProjectContext } from "@/lib/project-context";

const baseDate = new Date("2024-01-01T00:00:00.000Z");

const project = {
	id: "project-id",
	createdAt: baseDate,
	name: "Lorebook",
	description: "A universe for relational prompts",
	visibility: "private" as const,
	folders: DEFAULT_PROJECT_FOLDERS,
	userId: "user-id",
	forkedFromId: null,
	lastViewedSceneId: null,
};

const guardian = {
	id: "guardian-id",
	createdAt: baseDate,
	updatedAt: baseDate,
	name: "Aria",
	kind: "Guardian",
	summary: "Protector of the capital",
	startDate: null,
	endDate: null,
	projectId: project.id,
};

const prince = {
	id: "prince-id",
	createdAt: baseDate,
	updatedAt: baseDate,
	name: "Cassian",
	kind: "Prince",
	summary: "Heir torn between duty and rebellion",
	startDate: null,
	endDate: null,
	projectId: project.id,
};

test("relationship context is merged into chat prompts when a project is selected", () => {
	const projectContext = buildProjectContext({
		project,
		entities: [guardian, prince],
		attributes: [
			{
				id: "att-1",
				createdAt: baseDate,
				name: "Virtue",
				value: "Loyal to the oath",
				dataType: "text",
				startDate: null,
				endDate: null,
				entityId: guardian.id,
				projectId: project.id,
			},
		],
		relationships: [
			{
				id: "rel-1",
				createdAt: baseDate,
				type: "Allies",
				description: "Secret alliance to avoid war",
				startDate: null,
				endDate: null,
				projectId: project.id,
				sourceEntityId: guardian.id,
				targetEntityId: prince.id,
			},
		],
	});

	const groundedPrompt = `Base system prompt\n\nProject context:\n${projectContext}`;

	expect(groundedPrompt).toContain("Relationships:");
	expect(groundedPrompt).toContain("Allies between Aria and Cassian");
	expect(groundedPrompt).toContain("Virtue: Loyal to the oath");
});
