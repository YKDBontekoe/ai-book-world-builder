import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
	type BookGeneration,
	bookGeneration,
	type CanvasState,
	type GenerationStatus,
	type GenerationTaskLog,
	type TaskLogEntry,
} from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function getBookGenerationForProject({
	projectId,
}: {
	projectId: string;
}): Promise<BookGeneration | null> {
	try {
		const [generation] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.projectId, projectId));

		return generation ?? null;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load book generation",
		);
	}
}

export async function createBookGeneration({
	projectId,
	outlineId,
}: {
	projectId: string;
	outlineId?: string;
}): Promise<BookGeneration> {
	try {
		const [generation] = await db
			.insert(bookGeneration)
			.values({
				projectId,
				outlineId,
				status: "idle",
				canvasState: {
					activePane: "outline",
					paneState: {},
					lastUpdated: new Date().toISOString(),
				},
				taskLog: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return generation;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create book generation",
		);
	}
}

export async function updateCanvasState({
	generationId,
	canvasState,
}: {
	generationId: string;
	canvasState: CanvasState;
}): Promise<BookGeneration | null> {
	try {
		const [updated] = await db
			.update(bookGeneration)
			.set({
				canvasState,
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId))
			.returning();

		return updated ?? null;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to update canvas state",
		);
	}
}

export async function addTaskLogEntry({
	generationId,
	entry,
	overallStatus,
}: {
	generationId: string;
	entry: TaskLogEntry;
	overallStatus?: GenerationStatus;
}): Promise<BookGeneration | null> {
	try {
		const [existing] = await db
			.select()
			.from(bookGeneration)
			.where(eq(bookGeneration.id, generationId));

		if (!existing) {
			return null;
		}

		const currentLog = (existing.taskLog as GenerationTaskLog) ?? [];
		const updatedLog = [...currentLog, entry];

		const [updated] = await db
			.update(bookGeneration)
			.set({
				taskLog: updatedLog,
				...(overallStatus ? { status: overallStatus } : {}),
				updatedAt: new Date(),
			})
			.where(eq(bookGeneration.id, generationId))
			.returning();

		return updated ?? null;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to add task log entry",
		);
	}
}
