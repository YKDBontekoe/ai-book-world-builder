"use server";

import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import {
	bookGeneration,
	type GenerationSettings,
	project,
} from "@/lib/db/schema";
import { runGeneration } from "@/lib/generation";

/**
 * POST /api/generations/[id]/run
 * Triggers the book generation pipeline for a specific generation
 */
export async function POST(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: generationId } = await params;

	try {
		// Fetch the generation record
		const [generation] = await db
			.select({
				id: bookGeneration.id,
				status: bookGeneration.status,
				projectId: bookGeneration.projectId,
				settings: bookGeneration.settings,
				projectUserId: project.userId,
			})
			.from(bookGeneration)
			.innerJoin(project, eq(bookGeneration.projectId, project.id))
			.where(eq(bookGeneration.id, generationId));

		if (!generation) {
			return NextResponse.json(
				{ error: "Generation not found" },
				{ status: 404 },
			);
		}

		// Verify ownership
		if (generation.projectUserId !== session.user.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Don't start if already completed or failed
		if (generation.status === "completed" || generation.status === "failed") {
			return NextResponse.json(
				{ error: `Generation already ${generation.status}` },
				{ status: 400 },
			);
		}

		// Run the generation in the background (don't await)
		// This allows the request to return immediately while generation runs
		runGeneration({
			generationId,
			projectId: generation.projectId,
			userId: session.user.id,
			settings: (generation.settings as GenerationSettings) || {
				totalChapters: 1,
				pagesPerChapter: 5,
				revisionRounds: 1,
				writingStylePreset: "king",
				writerModelId: "gpt-4o-mini",
				reviewerModelId: "gpt-4o-mini",
				includePrologue: false,
				includeEpilogue: false,
				generateBackCoverBlurb: false,
				generateFrontCover: false,
				generateCharacterSheets: false,
				generateChapterSummaries: false,
				generateTableOfContents: false,
				runConsistencyCheck: false,
				contextSelection: {
					entities: [],
					outlines: [],
					scenes: [],
					drafts: [],
					sourceMaterials: [],
				},
			},
			callbacks: {
				onLog: (message, type) => {
					console.log(`[${type.toUpperCase()}] ${message}`);
				},
				onError: (error) => {
					console.error("Generation error:", error);
				},
			},
		}).catch((error) => {
			console.error("Generation failed:", error);
		});

		return NextResponse.json({
			success: true,
			message: "Generation started",
			generationId,
		});
	} catch (error) {
		console.error("Failed to start generation:", error);
		return NextResponse.json(
			{ error: "Failed to start generation" },
			{ status: 500 },
		);
	}
}
