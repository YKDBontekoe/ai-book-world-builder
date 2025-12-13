export const QUERY_KEYS = {
	templates: (projectId: string) => ["templates", projectId],
	projectContext: (projectId: string) => ["project-context", projectId],
	document: (documentId: string) => ["document", documentId],
};

export const STALE_TIMES = {
	// Templates rarely change, so we can keep them fresh for a long time
	TEMPLATES: 1000 * 60 * 60, // 1 hour
	// Project context changes when user edits, but can be cached for a bit
	CONTEXT: 1000 * 60 * 5, // 5 minutes
	// Documents can change frequently during editing, but we can cache reads
	DOCUMENT: 1000 * 60, // 1 minute
};

export const GC_TIMES = {
	// Keep templates in memory/storage for 24 hours
	TEMPLATES: 1000 * 60 * 60 * 24,
	// Keep context for 1 hour
	CONTEXT: 1000 * 60 * 60,
	// Keep documents for 10 minutes
	DOCUMENT: 1000 * 60 * 10,
};
