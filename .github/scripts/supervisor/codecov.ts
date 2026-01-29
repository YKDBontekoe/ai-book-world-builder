export function parseCodecovComment(body: string): string | null {
  const lines = body.split("\n");
  const affectedFiles: string[] = [];

  // Regex to find a markdown link in a table row: | [path/to/file](...) | ...
  const fileLinkRegex = /\|\s*\[([^\]]+)\]\(([^)]+)\)/;

  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;

    const match = line.match(fileLinkRegex);
    if (match) {
      const fileName = match[1];
      // Skip headers
      if (
        fileName.toLowerCase().includes("files") ||
        fileName.toLowerCase() === "impacted files"
      ) {
        continue;
      }

      // Check for negative change (coverage drop)
      // Matches -10% or -12.34%
      const dropMatch = line.match(/-(\d+(\.\d+)?%)/);
      if (dropMatch) {
        affectedFiles.push(`- ${fileName} (Coverage drop: -${dropMatch[1]})`);
        continue;
      }

      // If no drop, it might be just listing the file. Include it.
      affectedFiles.push(`- ${fileName}`);
    }
  }

  const uniqueFiles = Array.from(new Set(affectedFiles));

  if (uniqueFiles.length > 0) {
    return `Codecov report indicates issues in the following files:\n${uniqueFiles.join("\n")}\n\nPlease analyze the coverage report and add tests to cover the missing lines/branches in these files.`;
  }

  return null;
}
