export function normalizeTextContent(text: string): string {
	return text
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n")
		.replace(/\u0000/g, "")
		.replace(/[\t ]+\n/g, "\n")
		.replace(/\s+$/g, "")
		.trim();
}

export function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function deriveHeadings(text: string): string[] {
	const headings = new Set<string>();
	const lines = normalizeTextContent(text).split("\n");
	const headingRegex = /^(?:#+\s+|chapter\s+\d+[:\-\s]*)(.+)/i;

	for (const line of lines) {
		const match = line.match(headingRegex);
		if (match?.[1]) {
			const heading = match[1].trim();
			if (heading) {
				headings.add(heading);
			}
		}
	}

	return [...headings];
}
