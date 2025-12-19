import type { Entity } from "@/lib/db/schema";

export type DetectedEntity = {
	name: string;
	kind: "character" | "location" | "organization" | "item" | "event";
	confidence: number;
};

export type EntityDetails = {
	name: string;
	kind: string;
	summary: string;
	attributes: Array<{ name: string; value: string }>;
	sourceQuotes: string[];
};

export type InferredRelationship = {
	sourceEntityName: string;
	targetEntityName: string;
	type: string;
	description: string;
	confidence: number;
};

export type AnalysisResult = {
	sourceMaterialId: string;
	projectId: string;
	entities: Entity[];
	relationships: Array<{
		sourceId: string;
		targetId: string;
		type: string;
	}>;
	stats: {
		chunksAnalyzed: number;
		entitiesDetected: number;
		entitiesCreated: number;
		relationshipsCreated: number;
	};
};
