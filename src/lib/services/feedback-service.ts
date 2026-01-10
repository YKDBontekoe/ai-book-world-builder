import "server-only";
import { generateObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSelectedModelId } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import { db } from "@/lib/db";
import {
	type Feedback,
	type FeedbackType,
	feedback,
} from "@/lib/db/schema/feedback";
import { JulesClient } from "@/lib/jules-client";

const jules = new JulesClient();

export async function createFeedback(data: {
	userId?: string | null;
	type: FeedbackType;
	content: string;
	meta?: any;
}) {
	const [newFeedback] = await db
		.insert(feedback)
		.values({
			userId: data.userId || null,
			type: data.type,
			content: data.content,
			meta: data.meta,
		})
		.returning();

	if (data.type === "crash") {
		await triggerCrashHandler(newFeedback);
	}

	return newFeedback;
}

async function triggerCrashHandler(feedbackItem: Feedback) {
	try {
		const sourcesResult = await jules.listSources();
		const source = sourcesResult.sources[0];
		if (!source) {
			console.error("No sources found for Jules");
			return;
		}

		await jules.createSession({
			prompt: `Fix this crash report:\n\n${feedbackItem.content}\n\nMeta: ${JSON.stringify(feedbackItem.meta)}`,
			sourceName: source.name,
			automationMode: "AUTO_CREATE_PR",
			title: `Fix Crash: ${feedbackItem.id}`,
		});

		// Mark as processed since we handed it off to Jules
		await db
			.update(feedback)
			.set({ status: "processed", processedAt: new Date() })
			.where(eq(feedback.id, feedbackItem.id));
	} catch (error) {
		console.error("Failed to trigger Jules for crash:", error);
	}
}

export async function processDailyFeedback() {
	const pending = await db
		.select()
		.from(feedback)
		.where(eq(feedback.status, "pending"));

	if (pending.length === 0) return { processed: 0, groups: 0 };

	// Filter for feature requests (type 'feedback')
	const features = pending.filter((f) => f.type === "feedback");

	if (features.length === 0) return { processed: 0, groups: 0 };

	const modelId = await getSelectedModelId("large");

	const { object } = await generateObject({
		model: myProvider.languageModel(modelId),
		schema: z.object({
			groups: z.array(
				z.object({
					featureName: z.string(),
					summary: z.string(),
					feedbackIds: z.array(z.string()),
				}),
			),
		}),
		prompt: `Analyze the following user feedback items and group them by feature or topic.

        Feedback Items:
        ${features.map((f) => `- [ID: ${f.id}] ${f.content}`).join("\n")}
        `,
	});

	const sourcesResult = await jules.listSources();
	const source = sourcesResult.sources[0];

	if (!source) {
		console.error("No source found");
		return { processed: 0, groups: 0, error: "No source found" };
	}

	let processedCount = 0;

	for (const group of object.groups) {
		try {
			await jules.createSession({
				prompt: `Implement or improve the following feature based on user feedback:\n\nFeature: ${group.featureName}\nSummary: ${group.summary}`,
				sourceName: source.name,
				automationMode: "AUTO_CREATE_PR",
				title: `Feature Request: ${group.featureName}`,
			});

			for (const id of group.feedbackIds) {
				// Check if the id actually exists in our list to be safe
				if (features.find((f) => f.id === id)) {
					await db
						.update(feedback)
						.set({ status: "processed", processedAt: new Date() })
						.where(eq(feedback.id, id));
					processedCount++;
				}
			}
		} catch (e) {
			console.error(
				`Failed to create session for group ${group.featureName}`,
				e,
			);
		}
	}

	return { processed: processedCount, groups: object.groups.length };
}
