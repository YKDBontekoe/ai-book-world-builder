import { expect, test } from "@playwright/test";

import { buildLoreContext, outlineToPrompt } from "@/lib/story/lore";

const baseDate = new Date("2024-01-01T00:00:00.000Z");

const guardian = {
	id: "guardian-id",
	createdAt: baseDate,
	updatedAt: baseDate,
	name: "Aria",
	kind: "Guardian",
	summary: "Protector of the capital",
	startDate: null,
	endDate: null,
	projectId: "project-id",
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
	projectId: "project-id",
};

test("buildLoreContext lists entities and relationship names", () => {
	const lore = buildLoreContext({
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
				projectId: guardian.projectId,
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
				projectId: guardian.projectId,
				sourceEntityId: guardian.id,
				targetEntityId: prince.id,
			},
		],
	});

	expect(lore).toContain("Aria");
	expect(lore).toContain("Cassian");
	expect(lore).toContain("Allies");
	expect(lore).toContain("Secret alliance to avoid war");
});

test("outlineToPrompt formats pacing and tone with beats", () => {
	const prompt = outlineToPrompt({
		id: "outline-1",
		createdAt: baseDate,
		updatedAt: baseDate,
		title: "Chapter One",
		summary: "",
		pov: "Close third person",
		tone: "Tense",
		pacing: "Balanced",
		beats: ["Arrival at the docks", "Uneasy meeting"],
		projectId: guardian.projectId,
	});

	expect(prompt).toContain("Chapter One");
	expect(prompt).toContain("Close third person");
	expect(prompt).toContain("1. Arrival at the docks");
	expect(prompt).toContain("Uneasy meeting");
});
