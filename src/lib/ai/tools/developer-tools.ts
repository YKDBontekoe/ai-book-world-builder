import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "ai";
import { z } from "zod";
import { JulesClient } from "@/lib/jules-client";
import { getOctokit, getRepoDetails } from "@/lib/services/github-service";

// Helper for recursive file search
async function getFiles(dir: string): Promise<string[]> {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name);
			return dirent.isDirectory() ? getFiles(res) : res;
		}),
	);
	return Array.prototype.concat(...files);
}

export const searchDocumentation = () =>
	tool({
		description:
			"Searches and reads the project documentation in the docs/ folder.",
		inputSchema: z.object({
			query: z
				.string()
				.describe("The topic or keyword to search for in documentation."),
		}),
		execute: async ({ query }) => {
			try {
				const docsDir = path.join(process.cwd(), "docs");
				// Check if docs directory exists
				try {
					await fs.access(docsDir);
				} catch {
					return "Documentation directory (docs/) not found.";
				}

				const allFiles = await getFiles(docsDir);
				const mdFiles = allFiles.filter((f) => f.endsWith(".md"));

				const results = [];
				for (const file of mdFiles) {
					const content = await fs.readFile(file, "utf-8");
					const relativePath = path.relative(process.cwd(), file);

					if (
						relativePath.toLowerCase().includes(query.toLowerCase()) ||
						content.toLowerCase().includes(query.toLowerCase())
					) {
						// Truncate if too long to save tokens, but documentation is usually key
						results.push(`--- File: ${relativePath} ---\n${content}\n`);
					}
				}

				if (results.length === 0) {
					const relativeFiles = mdFiles.map((f) =>
						path.relative(process.cwd(), f),
					);
					return (
						"No documentation found matching that query. Available files: " +
						relativeFiles.join(", ")
					);
				}

				return results.join("\n\n");
			} catch (error) {
				return `Error searching documentation: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	});

export const createJulesTask = () =>
	tool({
		description:
			"Creates a GitHub issue and starts a Jules session to resolve it.",
		inputSchema: z.object({
			title: z.string().describe("The title of the task/issue."),
			description: z
				.string()
				.describe("Detailed description of what needs to be done."),
			labels: z
				.array(z.string())
				.optional()
				.describe("Labels to apply to the GitHub issue."),
		}),
		execute: async ({ title, description, labels }) => {
			try {
				const octokit = getOctokit();
				const { owner, repo } = await getRepoDetails();

				// 1. Create GitHub Issue
				const issueRes = await octokit.rest.issues.create({
					owner,
					repo,
					title,
					body: description,
					labels: labels || ["jules-task"],
				});

				const issue = issueRes.data;
				const issueNumber = issue.number;

				// 2. Initialize Jules
				const jules = new JulesClient();

				// 3. Find Source (Repository)
				// We assume the first source matching the repo name is the correct one, or just the first available if strict matching fails/isn't needed
				// The prompt logic in startFixSessionAction picks the first one.
				const sourcesResult = await jules.listSources(50);
				const sources = sourcesResult.sources || [];

				// Try to find a source that matches the repo
				const _currentRepoName = `${owner}/${repo}`;
				const matchingSource =
					sources.find(
						(s) => s.githubRepo?.owner === owner && s.githubRepo?.repo === repo,
					) || sources[0];

				if (!matchingSource) {
					return `Created GitHub Issue #${issueNumber}, but failed to start Jules session: No Jules sources available.`;
				}

				// 4. Create Jules Session
				const prompt =
					"\
I need you to fix the following GitHub Issue.\n\n**Issue #" +
					issueNumber +
					": " +
					title +
					"**\ncreated by @" +
					(issue.user?.login || "unknown") +
					"\n\n**Description:**\n" +
					description +
					"\n\n**Goal:**\nPlease analyze this issue, plan a solution, and create a Pull Request to fix it.\n";

				const session = await jules.createSession({
					prompt,
					title: `Fix #${issueNumber}: ${title}`,
					sourceName: matchingSource.name,
					startingBranch:
						matchingSource.githubRepo?.defaultBranch?.displayName || "main",
					requirePlanApproval: true,
				});

				// 5. Update Issue with Session Link
				// The session URL might be constructed or returned. JulesSession interface has 'url' but it might be the API resource name.
				// We'll just post a comment with the ID for now.
				const sessionUrl = `/admin/jules/chat/${session.id.split("/").pop()}`;

				await octokit.rest.issues.createComment({
					owner,
					repo,
					issue_number: issueNumber,
					body: `🤖 **Jules Session Started**\n\nI have started working on this task. You can follow my progress here: [Session ${session.id}](${sessionUrl})`,
				});

				return `Task created successfully!\n- GitHub Issue: ${issue.html_url}\n- Jules Session: ${session.name} (ID: ${session.id})`;
			} catch (error) {
				return `Error creating task: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	});
