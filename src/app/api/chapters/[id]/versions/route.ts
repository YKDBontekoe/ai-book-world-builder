import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { chapter, chapterVersion, project } from "@/lib/db/schema";

// Helper to verify access
async function verifyChapterAccess(chapterId: string, userId: string) {
	const result = await db
		.select({
			chapterId: chapter.id,
			projectUserId: project.userId,
			projectVisibility: project.visibility,
		})
		.from(chapter)
		.innerJoin(project, eq(chapter.projectId, project.id))
		.where(eq(chapter.id, chapterId))
		.limit(1);

	if (result.length === 0) return null;
	const match = result[0];

	// Owner has access
	if (match.projectUserId === userId) return true;

	// Public projects: only allow read access logic (checked by caller if needed)
	// For this specific API (versions), we likely only want owners to see version history/drafts
	// unless version history is public?
	// Given the context of "World Builder" and "Writing Tool", version history is usually private.
	// We will restrict to owner for now to be safe.
	return false;
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: chapterId } = await params;

	try {
		const hasAccess = await verifyChapterAccess(chapterId, session.user.id);
		if (!hasAccess) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const versions = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, chapterId))
			.orderBy(desc(chapterVersion.version));

		return NextResponse.json(versions);
	} catch (error) {
		console.error("Failed to fetch versions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch versions" },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: chapterId } = await params;

	try {
		const hasAccess = await verifyChapterAccess(chapterId, session.user.id);
		if (!hasAccess) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();
		// Basic validation since we are here
		if (!body || typeof body.content !== "string") {
			return NextResponse.json({ error: "Invalid content" }, { status: 400 });
		}

		const { content, generationId, createdBy = "user" } = body;

		// Get the next version number
		const existingVersions = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, chapterId))
			.orderBy(desc(chapterVersion.version));

		const nextVersion =
			existingVersions.length > 0 ? existingVersions[0].version + 1 : 1;

		const [newVersion] = await db
			.insert(chapterVersion)
			.values({
				chapterId,
				generationId,
				content,
				wordCount: content.split(/\s+/).length,
				version: nextVersion,
				createdBy,
				createdAt: new Date(),
			})
			.returning();

		return NextResponse.json(newVersion);
	} catch (error) {
		console.error("Failed to create version:", error);
		return NextResponse.json(
			{ error: "Failed to create version" },
			{ status: 500 },
		);
	}
}
