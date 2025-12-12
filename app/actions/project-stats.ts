"use server";

import { desc, eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import {
	db,
	getBookGenerationForProject,
	getChaptersForProject,
	getEntitiesForProject,
	getOutlinesForProject,
	getRelationshipsForProject,
} from "@/lib/db/queries";
import {
	chapterDraft,
	type Entity,
	type GenerationTaskLog,
	type Relationship,
} from "@/lib/db/schema";

export type EntityCounts = {
	characters: number;
	locations: number;
	items: number;
	events: number;
	organizations: number;
	other: number;
	total: number;
};

export type ChapterStatus =
	| "planned"
	| "drafting"
	| "drafted"
	| "review"
	| "final";

export type ChapterStatusCounts = {
	[K in ChapterStatus]: number;
} & { total: number };

export type ReadinessScores = {
	characters: { score: number; feedback: string };
	worldBuilding: { score: number; feedback: string };
	plotStructure: { score: number; feedback: string };
	overall: number;
};

export type ProjectStats = {
	entityCounts: EntityCounts;
	relationshipCount: number;
	outlineCount: number;
	chapterCounts: ChapterStatusCounts;
	readiness: ReadinessScores;
};

/**
 * Calculate readiness scores based on actual project content
 */
function calculateReadiness(
	entities: Entity[],
	relationships: Relationship[],
	outlineCount: number,
	chapterCount: number,
): ReadinessScores {
	const characters = entities.filter((e) => e.kind === "character");
	const locations = entities.filter((e) => e.kind === "location");
	const items = entities.filter((e) => e.kind === "item");
	const events = entities.filter((e) => e.kind === "event");

	// Character score: 0-100 based on count and detail
	let characterScore = 0;
	let characterFeedback = "Add your main characters to get started";
	if (characters.length >= 5) {
		characterScore = 80;
		characterFeedback = "Strong cast of characters";
	} else if (characters.length >= 3) {
		characterScore = 60;
		characterFeedback = "Good character foundation";
	} else if (characters.length >= 1) {
		characterScore = 30;
		characterFeedback = "Add more characters to build your cast";
	}
	// Bonus for summaries
	const charsWithSummary = characters.filter(
		(c) => c.summary && c.summary.length > 20,
	);
	if (
		charsWithSummary.length >= characters.length * 0.7 &&
		characters.length > 0
	) {
		characterScore = Math.min(100, characterScore + 20);
	}

	// World building score: locations + items + relationships
	let worldScore = 0;
	let worldFeedback = "Create locations and items for your world";
	const worldElements = locations.length + items.length + events.length;
	if (worldElements >= 10) {
		worldScore = 70;
		worldFeedback = "Rich world foundation";
	} else if (worldElements >= 5) {
		worldScore = 50;
		worldFeedback = "Good world elements, keep building";
	} else if (worldElements >= 2) {
		worldScore = 30;
		worldFeedback = "Add more locations and items";
	}
	// Bonus for relationships
	if (relationships.length >= 5) {
		worldScore = Math.min(100, worldScore + 30);
		worldFeedback = "Excellent world with rich connections";
	} else if (relationships.length >= 2) {
		worldScore = Math.min(100, worldScore + 15);
	}

	// Plot score: outlines + chapters
	let plotScore = 0;
	let plotFeedback = "Create an outline to plan your story";
	if (outlineCount > 0 && chapterCount >= 10) {
		plotScore = 80;
		plotFeedback = "Comprehensive story structure";
	} else if (outlineCount > 0 && chapterCount >= 5) {
		plotScore = 60;
		plotFeedback = "Good outline with chapters planned";
	} else if (outlineCount > 0) {
		plotScore = 40;
		plotFeedback = "Outline created, add chapters";
	}

	const overall = Math.round((characterScore + worldScore + plotScore) / 3);

	return {
		characters: { score: characterScore, feedback: characterFeedback },
		worldBuilding: { score: worldScore, feedback: worldFeedback },
		plotStructure: { score: plotScore, feedback: plotFeedback },
		overall,
	};
}

/**
 * Get aggregated project statistics for the book canvas
 */
export async function getProjectStats(
	projectId: string,
): Promise<ProjectStats | null> {
	const session = await auth();

	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		const [entities, relationships, outlines, chapters] = await Promise.all([
			getEntitiesForProject({ projectId }),
			getRelationshipsForProject({ projectId }),
			getOutlinesForProject({ projectId }),
			getChaptersForProject({ projectId }),
		]);

		// Count entities by type
		const entityCounts: EntityCounts = {
			characters: 0,
			locations: 0,
			items: 0,
			events: 0,
			organizations: 0,
			other: 0,
			total: entities.length,
		};

		for (const e of entities) {
			switch (e.kind) {
				case "character":
					entityCounts.characters++;
					break;
				case "location":
					entityCounts.locations++;
					break;
				case "item":
					entityCounts.items++;
					break;
				case "event":
					entityCounts.events++;
					break;
				case "organization":
					entityCounts.organizations++;
					break;
				default:
					entityCounts.other++;
			}
		}

		// Count chapters by status
		const chapterCounts: ChapterStatusCounts = {
			planned: 0,
			drafting: 0,
			drafted: 0,
			review: 0,
			final: 0,
			total: chapters.length,
		};

		for (const c of chapters) {
			const status = c.status as ChapterStatus;
			if (status in chapterCounts) {
				chapterCounts[status]++;
			} else {
				chapterCounts.planned++;
			}
		}

		const readiness = calculateReadiness(
			entities,
			relationships,
			outlines.length,
			chapters.length,
		);

		return {
			entityCounts,
			relationshipCount: relationships.length,
			outlineCount: outlines.length,
			chapterCounts,
			readiness,
		};
	} catch (error) {
		console.error("Error fetching project stats:", error);
		return null;
	}
}

export type SerializedRelationship = {
	id: string;
	createdAt: string;
	type: string;
	description: string | null;
	projectId: string;
	sourceEntityId: string;
	targetEntityId: string;
	startDate: string | null;
	endDate: string | null;
};

/**
 * Get relationships for a project
 */
export async function getRelationships(
	projectId: string,
): Promise<SerializedRelationship[]> {
	const session = await auth();

	if (!session) {
		throw new Error("Unauthorized");
	}

	const relationships = await getRelationshipsForProject({ projectId });

	return relationships.map((r) => ({
		...r,
		createdAt: r.createdAt.toISOString(),
		startDate: r.startDate?.toISOString() ?? null,
		endDate: r.endDate?.toISOString() ?? null,
	}));
}

export type SerializedChapter = {
	id: string;
	title: string;
	notes: string | null;
	status: string;
	sequence: number;
};

export type SerializedOutline = {
	id: string;
	title: string;
	summary: string | null;
	pov: string;
	tone: string;
	pacing: string;
	beats: string[] | null;
	chapters: SerializedChapter[];
};

/**
 * Get outline data with chapters for the Outline pane
 */
export async function getOutlineData(
	projectId: string,
): Promise<SerializedOutline | null> {
	const session = await auth();

	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		const [outlines, chapters] = await Promise.all([
			getOutlinesForProject({ projectId }),
			getChaptersForProject({ projectId }),
		]);

		if (outlines.length === 0) {
			return null;
		}

		// Get the most recent outline
		const currentOutline = outlines[0];

		// Map chapters to serialized format (sorted by sequence already from query)
		const serializedChapters: SerializedChapter[] = chapters.map((ch) => ({
			id: ch.id,
			title: ch.title,
			notes: ch.notes,
			status: ch.status,
			sequence: ch.sequence,
		}));

		return {
			id: currentOutline.id,
			title: currentOutline.title,
			summary: currentOutline.summary,
			pov: currentOutline.pov,
			tone: currentOutline.tone,
			pacing: currentOutline.pacing,
			beats: currentOutline.beats,
			chapters: serializedChapters,
		};
	} catch (error) {
		console.error("Error fetching outline data:", error);
		return null;
	}
}

export type TimelineEvent = {
	id: string;
	name: string;
	summary: string | null;
	startDate: string | null;
	endDate: string | null;
	kind: string;
};

/**
 * Get timeline events sorted by date
 */
export async function getTimelineEvents(
	projectId: string,
): Promise<TimelineEvent[]> {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const entities = await getEntitiesForProject({ projectId });

	// Filter for events or entities with dates
	const events = entities.filter((e) => e.kind === "event" || e.startDate);

	return events
		.map((e) => ({
			id: e.id,
			name: e.name,
			summary: e.summary,
			startDate: e.startDate?.toISOString() ?? null,
			endDate: e.endDate?.toISOString() ?? null,
			kind: e.kind,
		}))
		.sort((a, b) => {
			// Sort by start date, undated last
			if (!a.startDate && !b.startDate) return 0;
			if (!a.startDate) return 1;
			if (!b.startDate) return -1;
			return a.startDate.localeCompare(b.startDate);
		});
}

/**
 * Get the latest content for a chapter draft
 */
export async function getChapterDraft(
	chapterId: string,
): Promise<string | null> {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const drafts = await db
			.select()
			.from(chapterDraft)
			.where(eq(chapterDraft.chapterId, chapterId))
			.orderBy(desc(chapterDraft.createdAt))
			.limit(1);

		if (drafts.length === 0) return null;
		return drafts[0].content;
	} catch (error) {
		console.error("Error fetching chapter draft:", error);
		return null;
	}
}

/**
 * Get the generation log for a project
 */
export async function getGenerationLog(
	projectId: string,
): Promise<GenerationTaskLog | null> {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const generation = await getBookGenerationForProject({ projectId });
		if (!generation) return null;

		return generation.taskLog;
	} catch (error) {
		console.error("Error fetching generation log:", error);
		return null;
	}
}
