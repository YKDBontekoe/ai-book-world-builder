export const QUERY_KEYS = {
	templates: (projectId: string) => ["templates", projectId],
	projectContext: (projectId: string) => ["project-context", projectId],
	document: (documentId: string) => ["document", documentId],
	artifact: () => ["artifact"],
	artifactMetadata: (id: string) => ["artifact-metadata", id],
	chatVisibility: (chatId: string) => ["chat-visibility", chatId],
	chatHistory: (params?: Record<string, unknown>) => ["history", params],
	outline: (projectId: string) => ["outline", projectId],
	draft: (chapterId: string) => ["draft", chapterId],
	bible: (projectId: string) => ["bible", projectId],
	entities: (projectId: string) => ["entities", projectId],
	relationships: (projectId: string) => ["relationships", projectId],
	diagnostics: (projectId: string) => ["diagnostics", projectId],
	changelog: (projectId: string) => ["changelog", projectId],
	scenes: (projectId: string) => ["scenes", projectId],
	timeline: (projectId: string) => ["timeline", projectId],
	versions: (chapterId: string) => ["versions", chapterId],
	votes: (chatId: string) => ["votes", chatId],
	suggestions: (chatId: string) => ["suggestions", chatId],
};

export const STALE_TIMES = {
	// Templates rarely change, so we can keep them fresh for a long time
	TEMPLATES: 1000 * 60 * 60, // 1 hour
	// Project context changes when user edits, but can be cached for a bit
	CONTEXT: 1000 * 60 * 5, // 5 minutes
	// Documents can change frequently during editing, but we can cache reads
	DOCUMENT: 1000 * 60, // 1 minute
	// Local state should be infinite
	LOCAL: Number.POSITIVE_INFINITY,
	// Standard data fetch
	STANDARD: 1000 * 60 * 5, // 5 minutes
};

export const GC_TIMES = {
	// Keep templates in memory/storage for 24 hours
	TEMPLATES: 1000 * 60 * 60 * 24,
	// Keep context for 1 hour
	CONTEXT: 1000 * 60 * 60,
	// Keep documents for 10 minutes
	DOCUMENT: 1000 * 60 * 10,
	// Local state should be infinite or very long
	LOCAL: Number.POSITIVE_INFINITY,
};
