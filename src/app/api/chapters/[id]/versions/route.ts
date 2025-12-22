import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { chapter, chapterVersion } from "@/lib/db/schema";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: chapterId } = await params;

	try {
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
	const body = await request.json();
	const { content, generationId, createdBy = "user" } = body;

	try {
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
