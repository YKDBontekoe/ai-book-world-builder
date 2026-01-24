import fs from "fs/promises";
import path from "path";

/**
 * Recursively gets all markdown files in a directory.
 */
export async function getMarkdownFiles(dir: string): Promise<string[]> {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name);
			return dirent.isDirectory() ? getMarkdownFiles(res) : [res];
		}),
	);
	return files.flat().filter((f) => f.endsWith(".md"));
}

export interface SearchResult {
	file: string;
	content: string;
	similarity?: number;
}

/**
 * Searches markdown content for a query string using simple inclusion.
 */
export async function searchMarkdownContent(
	query: string,
	files: string[],
	options: { maxContentLength?: number } = {},
): Promise<SearchResult[]> {
	const results: SearchResult[] = [];

	for (const file of files) {
		const content = await fs.readFile(file, "utf-8");
		const relativePath = path.relative(process.cwd(), file);

		if (
			relativePath.toLowerCase().includes(query.toLowerCase()) ||
			content.toLowerCase().includes(query.toLowerCase())
		) {
			let resultContent = content;
			if (options.maxContentLength && content.length > options.maxContentLength) {
				resultContent =
					content.slice(0, options.maxContentLength) + "\n\n[TRUNCATED]";
			}

			results.push({
				file: relativePath,
				content: resultContent,
				similarity: 1,
			});
		}
	}

	return results;
}
