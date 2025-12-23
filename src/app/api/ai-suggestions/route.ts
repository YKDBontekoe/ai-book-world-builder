import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { DEFAULT_MODELS, isChatModelId } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import {
	getChaptersForProject,
	getEntitiesForProject,
	getOutlineForProject,
	getProjectByIdWithAccess,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export const maxDuration = 30;

export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session?.user) {
			return new ChatSDKError("unauthorized:chat").toResponse();
		}

		const { projectId, messages, modelId } = await request.json();

		let projectContext = "No project selected. The user is brainstorming.";

		if (projectId) {
			const [project, entities, outline, chapters] = await Promise.all([
				getProjectByIdWithAccess({ id: projectId, userId: session.user.id }),
				getEntitiesForProject({ projectId }),
				getOutlineForProject({ projectId }),
				getChaptersForProject({ projectId }),
			]);

			if (project) {
				// Construct a lightweight context to save tokens
				const entityList = entities
					.slice(0, 20) // Limit to top 20 entities
					.map((e: { name: string; kind: string }) => `- ${e.name} (${e.kind})`)
					.join("\n");

				const recentChapters = chapters
					.slice(-5) // Only last 5 chapters
					.map(
						(c: { sequence: number; title: string }) =>
							`- Ch.${c.sequence}: ${c.title}`,
					)
					.join("\n");

				const outlineSummary = outline
					? `Outline: ${outline.title}\n${outline.summary?.slice(0, 300) ?? ""}...`
					: "No outline yet.";

				projectContext = `
Project: ${project.name}
Description: ${project.description ?? "N/A"}

${outlineSummary}

Entities (Top 20):
${entityList || "None"}

Recent Chapters:
${recentChapters || "None"}
`.trim();
			}
		}

		// Get last few user messages for immediate context
		const recentMessages = messages?.slice(-3) || [];
		const conversationContext = recentMessages
			.map((m: any) => `${m.role}: ${m.content}`)
			.join("\n");

		const effectiveModelId = isChatModelId(modelId)
			? modelId
			: DEFAULT_MODELS.light;

		const { object } = await generateObject({
			model: myProvider.languageModel(effectiveModelId),
			mode: "json",
			schema: z.object({
				suggestions: z
					.array(
						z.object({
							label: z.string().describe("Short button label (2-4 words)"),
							prompt: z.string().describe("The full prompt to send to the AI"),
							type: z
								.enum([
									"story",
									"character",
									"world",
									"analysis",
									"creative",
									"brainstorm",
								])
								.describe("Category for styling"),
							reasoning: z
								.string()
								.optional()
								.describe("Why this is suggested"),
						}),
					)
					.min(3)
					.max(5), // allow 3-5 suggestions for robustness
			}),
			prompt: `You are a creative writing assistant. Suggest 4 relevant next steps for the user.

PROJECT CONTEXT:
${projectContext}

RECENT CONVERSATION:
${conversationContext}

CRITICAL: Return a JSON object with a "suggestions" key containing an array of suggestion objects.
Each suggestion object MUST have: "label", "prompt", "type", and "reasoning".

The "type" field MUST be EXACTLY one of these values (no variations):
- "story" - for plot, chapters, drafting, scenes, narrative flow
- "character" - for characters, backstories, relationships between characters
- "world" - for worldbuilding, lore, settings, locations, magic systems
- "analysis" - for critique, feedback, theme analysis, pacing review
- "creative" - for surprises, twists, creative prompts
- "brainstorm" - for brainstorming, ideation, exploring options

DO NOT use any other type values like "scene", "relationship", "draft", etc. Map those concepts to the above categories.
DO NOT use Markdown code blocks (like \`\`\`json). Return RAW JSON only.

GUIDELINES:
- If no project, suggest brainstorming or world creation
- If project has characters, suggest developing them (type: "character")
- If chapters exist, suggest drafting next chapter (type: "story")
- Make prompts actionable
`,
		});

		return new Response(JSON.stringify(object.suggestions), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Suggestion Generation Error:", error);
		return new Response(JSON.stringify([]), { status: 500 });
	}
}
