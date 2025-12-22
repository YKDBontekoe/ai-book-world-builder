import { generateObject, tool } from "ai";
import { z } from "zod";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { addTaskLogEntry, updateCanvasState } from "@/lib/db/queries";
import { getGatewayIdForRole } from "@/lib/ai/model-routing";
import { retrieveContext } from "@/lib/ai/rag";
import { projectAnalytics } from "@/lib/services/project-analytics";

// Human-readable action descriptions
const ACTION_TITLES: Record<string, string> = {
	update_outline: "Update Story Outline",
	update_scenes: "Plan Scene Cards",
	draft_scene: "Write Scene",
	review_diagnostics: "Run Diagnostics",
	update_bible: "Update World Bible",
	none: "No Action Needed",
};

const ACTION_ICONS: Record<string, string> = {
	update_outline: "📋",
	update_scenes: "🎬",
	draft_scene: "✍️",
	review_diagnostics: "🔍",
	update_bible: "📚",
	none: "✅",
};

export const orchestrateBook = ({ dataStream }: { dataStream?: any }) =>
	tool({
		description:
			"The Brain. Analyzes project state and decides the next step in the book generation pipeline. Use this tool when the user asks to generate the book, write chapters, or continue the story.",
		inputSchema: z.object({
			projectId: z.string().describe("The ID of the project"),
			userRequest: z
				.string()
				.optional()
				.describe("Specific user instruction (e.g., 'Make chapter 3 scarier')"),
			currentCanvasState: z
				.any()
				.optional()
				.describe("Current state of the UI canvas"),
		}),
		execute: async (args: any) => {
			const { projectId, userRequest, currentCanvasState } = args;
			let generationId: string | undefined;

			// Helper for dual-logging (Stream + DB)
			const logProgress = async (message: string) => {
				// 1. Stream to Chat UI
				if (dataStream) {
					dataStream.write({
						type: "tool-log",
						message,
						tool: "orchestrateBook",
					});
				}

				// 2. Persist to Canvas DB (if generation active)
				if (generationId) {
					try {
						await addTaskLogEntry({
							generationId,
							entry: {
								id: crypto.randomUUID(),
								timestamp: new Date().toISOString(),
								type: "tool_call", // "tool_call" acts as "system activity" here
								modelId: "orchestrator",
								content: message,
							},
						});
					} catch (err) {
						console.error("Failed to log progress to DB", err);
					}
				}
			};

			await logProgress("Analyzing your project...");

			// 1. Fetch Project Data (Core Context)
			const projectData = await getFullProjectDataForGeneration({ projectId });

			if (!projectData) return { error: "Project data not found" };

			// Capture ID for subsequent logs
			generationId = projectData.generation?.id;

			// 2. Compute Project Statistics (delegated to service)
            const projectStats = await projectAnalytics.getProjectStats(projectId, projectData);

			// 3. Calculate Readiness Score (delegated to service)
            const readinessScore = projectAnalytics.calculateReadinessScore(projectStats);

			await logProgress(
				`Found ${projectStats.characters} characters, ${projectStats.chapters} chapters...`,
			);

			// 4. RAG Retrieval (Context Bank)
			await logProgress("Retrieving relevant context from story engine...");

			const query =
				userRequest ||
				`Current state of ${currentCanvasState?.activePane || "story"}`;

            const entities = projectData.entities || [];
			const ragContext = await retrieveContext({
				query,
				candidates: [
					...entities.map((e) => ({
						content: `${e.name} (${e.kind}): ${e.summary || ""}`,
						metadata: { id: e.id, type: "entity" },
					})),
					...(projectData.outlines || []).map((o) => ({
						content: o.title + "\n" + (o.summary || ""),
						metadata: { id: o.id, type: "outline" },
					})),
				],
				topK: 10,
			});

			await logProgress("Deciding the best next step...");

			// 5. Orchestrator Reasoning
			const orchestratorModel = await getGatewayIdForRole("orchestrator");

			const { object: decision } = await generateObject({
				model: orchestratorModel as any,
				schema: z.object({
					thoughtProcess: z.string().describe("Reasoning behind the decision"),
					nextAction: z.enum([
						"update_outline",
						"update_scenes",
						"draft_scene",
						"review_diagnostics",
						"update_bible",
						"none",
					]),
					targetId: z
						.string()
						.optional()
						.describe("ID of the chapter/scene/entity to act on"),
					targetName: z
						.string()
						.optional()
						.describe(
							"Human-readable name of the target (e.g., 'Chapter 1: The Beginning')",
						),
					instructions: z
						.string()
						.describe("Specific instructions for the sub-tool"),
					actionDescription: z
						.string()
						.describe(
							"A brief, user-friendly explanation of what this action will accomplish",
						),
					suggestedCanvasPane: z
						.enum([
							"outline",
							"scenes",
							"draft",
							"diagnostics",
							"bible",
							"changes",
						])
						.describe("Which pane should be active"),
				}),
				prompt: `
You are the Orchestrator of a book generation pipeline.
User Request: ${userRequest || "Continue generation based on current state"}

Project: "${projectData.project.name}"
Summary: ${projectData.project.description || "No summary"}
Current Pane: ${currentCanvasState?.activePane || "none"}

Project Stats:
- Characters: ${projectStats.characters}
- Locations: ${projectStats.locations}
- Outlines: ${projectStats.outlines}
- Chapters: ${projectStats.chapters}
- Scenes: ${projectStats.scenes} (${projectStats.draftedScenes} drafted, ${projectStats.plannedScenes} planned)
- Readiness: ${readinessScore}%

Relevant Context:
${ragContext.map((c) => `- ${c.content}`).join("\n")}

Decide the best next action based on the user's request and project state.
- update_outline: Modify story structure, plot beats, pacing
- update_scenes: Create or reorganize scene cards for a chapter
- draft_scene: Write actual prose for a specific scene
- review_diagnostics: Check for continuity issues or inconsistencies
- update_bible: Add/update characters, locations, world-building elements
- none: Project is complete or no action is needed right now

Provide a clear, friendly actionDescription that explains what will happen in plain English.
If targeting a specific chapter or scene, provide its human-readable name in targetName.
				`,
			});

			// 6. Log the Orchestrator's thought
			if (projectData.generation?.id) {
				await addTaskLogEntry({
					generationId: projectData.generation.id,
					entry: {
						id: crypto.randomUUID(),
						timestamp: new Date().toISOString(),
						type: "orchestrator",
						modelId: orchestratorModel,
						content: decision.thoughtProcess,
						metadata: { action: decision.nextAction },
					},
				});

				// 7. Update Canvas State
				await updateCanvasState({
					generationId: projectData.generation.id,
					canvasState: {
						activePane: decision.suggestedCanvasPane,
						paneState: currentCanvasState?.paneState || {},
						lastUpdated: new Date().toISOString(),
					},
				});
			}

			// Build human-readable next step preview
			const actionTitle =
				ACTION_TITLES[decision.nextAction] || decision.nextAction;
			const actionIcon = ACTION_ICONS[decision.nextAction] || "🔄";

			if (dataStream) {
				dataStream.write({
					type: "tool-log",
					message: `${actionIcon} ${actionTitle}`,
					tool: "orchestrateBook",
				});
			}

			return {
				projectName: projectData.project.name,
				projectStats,
				readinessScore,
				decision: {
					...decision,
					actionTitle,
					actionIcon,
				},
				ragContextUsed: ragContext.length,
				nextStepPreview: decision.actionDescription || decision.instructions,
			};
		},
	});
