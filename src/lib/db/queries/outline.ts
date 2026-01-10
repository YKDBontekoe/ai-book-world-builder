import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type Outline, outline } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function createOutline({
	projectId,
	title,
	summary,
	pov,
	tone,
	pacing,
	beats,
}: {
	projectId: string;
	title: string;
	summary?: string;
	pov: string;
	tone: string;
	pacing: string;
	beats: string[];
}): Promise<Outline> {
	try {
		const [createdOutline] = await db
			.insert(outline)
			.values({
				projectId,
				title,
				summary,
				pov,
				tone,
				pacing,
				beats,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return createdOutline;
	} catch (_error) {
		throw new ChatSDKError("bad_request:database", "Failed to save outline");
	}
}

export async function getOutlinesForProject({
	projectId,
}: {
	projectId: string;
}): Promise<Outline[]> {
	try {
		return await db
			.select()
			.from(outline)
			.where(eq(outline.projectId, projectId))
			.orderBy(desc(outline.updatedAt));
	} catch (_error) {
		throw new ChatSDKError("bad_request:database", "Failed to load outlines");
	}
}

export async function getOutlineById({
	id,
}: {
	id: string;
}): Promise<Outline | null> {
	try {
		const [selectedOutline] = await db
			.select()
			.from(outline)
			.where(eq(outline.id, id));

		return selectedOutline ?? null;
	} catch (_error) {
		throw new ChatSDKError("bad_request:database", "Failed to load outline");
	}
}

export async function getOutlineForProject({
	projectId,
}: {
	projectId: string;
}) {
	try {
		const [result] = await db
			.select()
			.from(outline)
			.where(eq(outline.projectId, projectId));

		return result;
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load outline for project",
		);
	}
}
