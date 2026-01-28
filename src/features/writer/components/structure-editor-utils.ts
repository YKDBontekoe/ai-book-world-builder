export interface ParsedNode {
	type: "chapter" | "scene" | "unknown";
	title: string;
	children?: ParsedNode[];
	lineIndex: number;
}

export function smartFormat(text: string): string {
	const lines = text.split("\n");
	const formattedLines: string[] = [];
	let chapterCount = 0;
	let sceneCount = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// Detect Chapter
		if (
			line.toLowerCase().startsWith("chapter") ||
			/^\d+\./.test(line) ||
			(line.endsWith(":") && !line.toLowerCase().includes("scene"))
		) {
			chapterCount++;
			sceneCount = 0;
			// Clean up title
			let title = line
				.replace(/^chapter\s*\d*[:.]?\s*/i, "")
				.replace(/^\d+\.\s*/, "")
				.replace(/:$/, "");
			if (!title) title = "Untitled Chapter";

			if (formattedLines.length > 0) {
				formattedLines.push("");
			}
			formattedLines.push(`Chapter ${chapterCount}: ${title}`);
		}
		// Detect Scene
		else if (
			line.toLowerCase().startsWith("scene") ||
			line.startsWith("-") ||
			line.startsWith("*")
		) {
			sceneCount++;
			let title = line
				.replace(/^[-*]\s*/, "")
				.replace(/^scene\s*\d*[:.]?\s*/i, "");
			if (!title) title = "Untitled Scene";

			formattedLines.push(`  Scene ${sceneCount}: ${title}`);
		}
		// Treat loose text as scene if we are inside a chapter
		else if (chapterCount > 0) {
			sceneCount++;
			formattedLines.push(`  Scene ${sceneCount}: ${line}`);
		}
		// Treat loose text at start as Chapter if no chapter yet
		else {
			chapterCount++;
			formattedLines.push(`Chapter ${chapterCount}: ${line}`);
		}
	}

	return formattedLines.join("\n");
}

export function parseStructure(text: string): ParsedNode[] {
	const lines = text.split("\n");
	const nodes: ParsedNode[] = [];
	let currentChapter: ParsedNode | null = null;

	lines.forEach((line, index) => {
		const trimmed = line.trim();
		if (!trimmed) return;

		if (trimmed.match(/^chapter/i)) {
			currentChapter = {
				type: "chapter",
				title: trimmed,
				children: [],
				lineIndex: index,
			};
			nodes.push(currentChapter);
		} else if (trimmed.match(/^([-*]|scene)/i)) {
			const sceneNode: ParsedNode = {
				type: "scene",
				title: trimmed.replace(/^[-*]\s*/, ""),
				lineIndex: index,
			};
			if (currentChapter) {
				currentChapter.children?.push(sceneNode);
			} else {
				nodes.push({ ...sceneNode, type: "unknown" });
			}
		} else {
			// Fallback for typed text that isn't clearly formatted
			if (currentChapter) {
				currentChapter.children?.push({
					type: "scene",
					title: trimmed,
					lineIndex: index,
				});
			} else {
				nodes.push({
					type: "chapter",
					title: trimmed,
					lineIndex: index,
				});
				currentChapter = nodes[nodes.length - 1];
			}
		}
	});
	return nodes;
}
