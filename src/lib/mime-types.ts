export const supportedIngestionMimeTypes = new Set<string>([
	"application/pdf",
	"application/epub+zip",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"text/plain",
]);

export function isSupportedIngestionMimeType(mimeType: string): boolean {
	return supportedIngestionMimeTypes.has(mimeType.toLowerCase());
}
