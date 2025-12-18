import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
	db,
	getEntitiesForProject,
	getOutlinesForProject,
	getProjectByIdWithAccess,
} from "@/lib/db/queries";
import { chapter, chapterDraft, scene, sourceMaterial } from "@/lib/db/schema";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		const { id: projectId } = await params;

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const project = await getProjectByIdWithAccess({
			id: projectId,
			userId: session.user.id,
		});

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		// Fetch all context data for the project
		const [entities, outlines, scenes, chapters, drafts, materials] =
			await Promise.all([
				getEntitiesForProject({ projectId }),
				getOutlinesForProject({ projectId }),
				db
					.select({
						id: scene.id,
						title: scene.title,
						chapterId: scene.chapterId,
					})
					.from(scene)
					.where(eq(scene.projectId, projectId)),
				db
					.select({
						id: chapter.id,
						title: chapter.title,
					})
					.from(chapter)
					.where(eq(chapter.projectId, projectId)),
				db
					.select({
						id: chapterDraft.id,
						chapterId: chapterDraft.chapterId,
					})
					.from(chapterDraft)
					.where(eq(chapterDraft.projectId, projectId)),
				db
					.select({
						id: sourceMaterial.id,
						filename: sourceMaterial.filename,
					})
					.from(sourceMaterial)
					.where(eq(sourceMaterial.projectId, projectId)),
			]);

		// Map drafts to include chapter titles
		const chaptersMap = new Map(chapters.map((c) => [c.id, c.title]));
		const draftsWithTitles = drafts.map((d) => ({
			id: d.id,
			chapterTitle: chaptersMap.get(d.chapterId) || "Unknown Chapter",
		}));

		return NextResponse.json({
			entities: entities.map((e) => ({
				id: e.id,
				name: e.name,
				kind: e.kind,
			})),
			outlines: outlines.map((o) => ({
				id: o.id,
				title: o.title,
			})),
			scenes: scenes.map((s) => ({
				id: s.id,
				title: s.title,
				chapterId: s.chapterId,
			})),
			drafts: draftsWithTitles,
			sourceMaterials: materials.map((m) => ({
				id: m.id,
				filename: m.filename,
			})),
		});
	} catch (error) {
		console.error("Error fetching project context:", error);
		return NextResponse.json(
			{ error: "Failed to fetch project context" },
			{ status: 500 },
		);
	}
}
