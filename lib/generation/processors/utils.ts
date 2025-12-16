import { db } from "@/lib/db/queries";
import { bookGenerationAsset, bookGenerationStep, chapter } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function saveAsset(
	generationId: string,
	assetType: string,
	content: string,
	imageUrl?: string,
): Promise<void> {
	await db.insert(bookGenerationAsset).values({
		generationId,
		assetType,
		content,
		imageUrl,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
}

export async function updateStepOutput(
	stepId: string,
	data: {
		agentOutput?: string;
		wordCount?: number;
		tokenCount?: number;
		usage?: any;
		reviewFeedback?: string;
	},
) {
	await db
		.update(bookGenerationStep)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(bookGenerationStep.id, stepId));
}

export async function updateStepStatus(stepId: string, status: string): Promise<void> {
	const now = new Date();
	const updates: any = { status, updatedAt: now };

	if (status === "running") {
		updates.startedAt = now;
	} else if (status === "completed" || status === "failed") {
		updates.completedAt = now;
	}

	await db
		.update(bookGenerationStep)
		.set(updates)
		.where(eq(bookGenerationStep.id, stepId));
}

export async function getChapterInfo(chapterId: string | null) {
	if (!chapterId) return null;
	const [ch] = await db.select().from(chapter).where(eq(chapter.id, chapterId));
	return ch;
}
