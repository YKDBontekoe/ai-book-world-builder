"use server";

import { z } from "zod";
import { generateText, tool } from "ai";
import { createAdminAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import { chat, message } from "@/lib/db/schema/chat";
import { eq, desc, and } from "drizzle-orm";
import { getSelectedModelId } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import { executeFeaturePlanAction } from "@/app/actions/github";
import { createJulesSessionAction, listJulesSourcesAction } from "@/app/actions/jules";

// ============================================================================
// Schemas
// ============================================================================

const createSessionSchema = z.object({
	title: z.string().optional(),
});

const getSessionSchema = z.object({
	sessionId: z.string().uuid(),
});

const chatMessageSchema = z.object({
	sessionId: z.string().uuid(),
	content: z.string().min(1),
});

const executePlanSchema = z.object({
	sessionId: z.string().uuid(),
	plan: z.object({
		title: z.string(),
		description: z.string(),
		tasks: z.array(
			z.object({
				title: z.string(),
				description: z.string(),
			}),
		),
	}),
    sourceName: z.string().optional(),
});

const messagePartSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("text"),
		text: z.string(),
	}),
	z.object({
		type: z.literal("tool-invocation"),
		toolCallId: z.string(),
		toolName: z.string(),
		args: z.any(),
	}),
]);

type MessagePart = z.infer<typeof messagePartSchema>;

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new Planner Chat Session.
 */
export const createPlannerSessionAction = createAdminAction({
	input: createSessionSchema,
	handler: async ({ input, user }) => {
		const [newChat] = await db
			.insert(chat)
			.values({
				title: input.title || "New Plan",
				userId: user.id,
				createdAt: new Date(),
				visibility: "private",
			})
			.returning();

		return newChat;
	},
});

/**
 * Retrieves a Planner Chat Session and its messages.
 */
export const getPlannerSessionAction = createAdminAction({
	input: getSessionSchema,
	handler: async ({ input, user }) => {
		const session = await db.query.chat.findFirst({
			where: and(eq(chat.id, input.sessionId), eq(chat.userId, user.id)),
		});

		if (!session) {
			throw new Error("Session not found");
		}

		const messages = await db.query.message.findMany({
			where: eq(message.chatId, input.sessionId),
			orderBy: [desc(message.createdAt)],
		});

		return {
			session,
			messages: messages.reverse(),
		};
	},
});

/**
 * Sends a message to the Planner Chat and gets a response.
 */
export const chatWithPlannerAction = createAdminAction({
	input: chatMessageSchema,
	handler: async ({ input, user }) => {
		// Verify ownership
		const session = await db.query.chat.findFirst({
			where: and(eq(chat.id, input.sessionId), eq(chat.userId, user.id)),
		});

		if (!session) {
			throw new Error("Session not found or access denied");
		}

		// 1. Save User Message
		await db.insert(message).values({
			chatId: input.sessionId,
			role: "user",
			parts: [{ type: "text", text: input.content }],
			attachments: [],
			createdAt: new Date(),
		});

		// 2. Fetch History
		const history = await db.query.message.findMany({
			where: eq(message.chatId, input.sessionId),
			orderBy: [desc(message.createdAt)],
			limit: 20,
		});

		// 3. Call AI
		const modelId = await getSelectedModelId("large");

		const response = await generateText({
			model: myProvider.languageModel(modelId),
			system: "You are a helpful assistant helping the user plan software features. You can propose plans using the 'propose_plan' tool.",
			messages: history.reverse().map((m) => {
				const parsedParts = z.array(messagePartSchema).safeParse(m.parts);
				const content = parsedParts.success
					? parsedParts.data.filter(p => p.type === "text").map(p => p.text).join("")
					: "";
				return {
					role: m.role as "user" | "assistant",
					content,
				};
			}),
			tools: {
				propose_plan: tool({
					description: "Propose a feature plan with a title, description, and list of tasks.",
					parameters: z.object({
						title: z.string(),
						description: z.string(),
						tasks: z.array(z.object({
							title: z.string(),
							description: z.string(),
						})),
					}),
				}),
			},
		});

		// 4. Save Assistant Response
		const parts: MessagePart[] = [{ type: "text", text: response.text }];

		if (response.toolCalls && response.toolCalls.length > 0) {
			for (const toolCall of response.toolCalls) {
				parts.push({
					type: "tool-invocation",
					toolCallId: toolCall.toolCallId,
					toolName: toolCall.toolName,
					args: toolCall.args,
				});
			}
		}

		// Validate parts before insert (though we constructed them safely above)
		const validatedParts = z.array(messagePartSchema).parse(parts);

		const [assistantMessage] = await db.insert(message).values({
			chatId: input.sessionId,
			role: "assistant",
			parts: validatedParts,
			attachments: [],
			createdAt: new Date(),
		}).returning();

		return assistantMessage;
	},
});

/**
 * Executes a proposed plan: creates GitHub issues and starts a Jules session.
 */
export const executePlannerPlanAction = createAdminAction({
	input: executePlanSchema,
	handler: async ({ input, user }) => {
		// Verify ownership
		const session = await db.query.chat.findFirst({
			where: and(eq(chat.id, input.sessionId), eq(chat.userId, user.id)),
		});

		if (!session) {
			throw new Error("Session not found or access denied");
		}

        // 1. Determine Source
        let sourceName = input.sourceName;
        if (!sourceName) {
            const sourcesRes = await listJulesSourcesAction();
            if (sourcesRes.success && sourcesRes.data.length > 0) {
                sourceName = sourcesRes.data[0].name;
            } else {
                throw new Error("No Jules sources available to execute plan.");
            }
        }

		// 2. Create GitHub Issues
		const featurePlan = {
			parentIssue: {
				title: input.plan.title,
				body: input.plan.description,
				labels: ["enhancement", "jules-epic"],
			},
			childIssues: input.plan.tasks.map(t => ({
				title: t.title,
				body: t.description,
				labels: ["jules-task"],
			})),
		};

		const executionResult = await executeFeaturePlanAction(featurePlan);
		if (!executionResult.success) {
			throw new Error(executionResult.error);
		}

		// 3. Start Jules Session
        const prompt = `Implement the feature "${input.plan.title}".

        Refers to GitHub Issue #${executionResult.data.parentNumber}.

        Description: ${input.plan.description}

        Sub-tasks:
        ${input.plan.tasks.map(t => `- ${t.title}`).join("\n")}
        `;

        const sessionResult = await createJulesSessionAction({
            prompt: prompt,
            title: `Impl: ${input.plan.title}`,
            sourceName: sourceName,
            automationMode: "auto", // Default to auto for "send out to jules"
            requirePlanApproval: true, // Safety check
        });

        if (!sessionResult.success) {
            throw new Error(sessionResult.error);
        }

        return {
            issues: executionResult.data,
            session: sessionResult.data
        };
	},
});
