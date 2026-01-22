export type TokenStats = {
	totalCost: number;
	totalInputTokens: number;
	totalOutputTokens: number;
	byModel: Record<
		string,
		{
			cost: number;
			inputTokens: number;
			outputTokens: number;
		}
	>;
	byFeature: {
		chat: { cost: number; inputTokens: number; outputTokens: number };
		generation: { cost: number; inputTokens: number; outputTokens: number };
	};
};

export type EntityStats = {
	totalEntities: number;
	byKind: Record<string, number>;
	mostConnected: {
		id: string;
		name: string;
		kind: string;
		connections: number;
	}[];
};

export type ActivityStats = {
	totalProjects: number;
	totalChapters: number;
	totalScenes: number;
	totalWords: number;
	lastActive: Date | null;
};

export type UsageHistory = {
	date: string;
	cost: number;
	tokens: number;
}[];
