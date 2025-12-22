import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { type BookExport, bookExport, project } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function getExportsForUser({
	userId,
}: {
	userId: string;
}): Promise<Array<BookExport & { projectName: string }>> {
	try {
		const exports = await db
			.select({
				id: bookExport.id,
				createdAt: bookExport.createdAt,
				projectId: bookExport.projectId,
				blobUrl: bookExport.blobUrl,
				format: bookExport.format,
				status: bookExport.status,
				error: bookExport.error,
				userId: bookExport.userId,
				projectName: project.name,
			})
			.from(bookExport)
			.innerJoin(project, eq(bookExport.projectId, project.id))
			.where(eq(bookExport.userId, userId))
			.orderBy(desc(bookExport.createdAt));

		return exports;
	} catch (error) {
		console.error("Failed to get exports for user:", error);
		throw new ChatSDKError(
			"bad_request:database",
			`Failed to get exports for user: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export async function deleteExport({
	exportId,
	userId,
}: {
	exportId: string;
	userId: string;
}): Promise<BookExport | null> {
	try {
		const [deleted] = await db
			.delete(bookExport)
			.where(and(eq(bookExport.id, exportId), eq(bookExport.userId, userId)))
			.returning();
		return deleted ?? null;
	} catch (_error) {
		throw new ChatSDKError("bad_request:database", "Failed to delete export");
	}
}
