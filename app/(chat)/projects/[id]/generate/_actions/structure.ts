"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { db, getProjectByIdWithAccess } from "@/lib/db/queries";
import * as schema from "@/lib/db/schema";
import {
	chapter,
	chapterVersion,
	scene,
} from "@/lib/db/schema";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { withChapterAuth, withProjectAuth, withSceneAuth } from "./utils";

export async function getChapterVersions(chapterId: string) {
	return withChapterAuth(chapterId, async () => {
		try {
			const versions = await db
				.select()
				.from(chapterVersion)
				.where(eq(chapterVersion.chapterId, chapterId))
				.orderBy(desc(chapterVersion.version));

			return { versions };
		} catch (error) {
			return { error: "Failed to fetch versions", versions: [] };
		}
	});
}

export async function restoreChapterVersion(versionId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	try {
		const [version] = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.id, versionId));

		if (!version) {
			return { error: "Version not found" };
		}

		// Verify ownership via chapter -> project
		const [targetChapter] = await db
			.select()
			.from(chapter)
			.where(eq(chapter.id, version.chapterId));

		if (!targetChapter) return { error: "Chapter not found" };

		const project = await getProjectByIdWithAccess({
			id: targetChapter.projectId,
			userId: session.user.id,
		});

		if (!project || project.userId !== session.user.id) {
			return { error: "Unauthorized" };
		}

		// Create a new version with the restored content
		const [latestVersion] = await db
			.select()
			.from(chapterVersion)
			.where(eq(chapterVersion.chapterId, version.chapterId))
			.orderBy(desc(chapterVersion.version))
			.limit(1);

		const newVersion = (latestVersion?.version || 0) + 1;

		await db.insert(chapterVersion).values({
			chapterId: version.chapterId,
			content: version.content,
			wordCount: version.wordCount,
			version: newVersion,
			createdBy: "user",
			createdAt: new Date(),
		});

		return { success: true };
	} catch (error) {
		return { error: "Failed to restore version" };
	}
}

export async function getProjectStructure(projectId: string) {
	return withProjectAuth(projectId, async () => {
		try {
			const chapters = await db.query.chapter.findMany({
				where: (chapter, { eq }) => eq(chapter.projectId, projectId),
				orderBy: (chapter, { asc }) => [asc(chapter.sequence)],
			});

			const scenes = await db.query.scene.findMany({
				where: (scene, { eq }) => eq(scene.projectId, projectId),
				orderBy: (scene, { asc }) => [asc(scene.sequence)],
			});

			const structure = chapters.map((ch) => ({
				...ch,
				scenes: scenes.filter((s) => s.chapterId === ch.id),
			}));

			const structureText = structure
				.map(
					(ch) =>
						`Chapter ${ch.sequence}: ${ch.title}\n${ch.scenes
							.map((s) => `- Scene: ${s.title}`)
							.join("\n")}`,
				)
				.join("\n\n");

			return { structure, structureText };
		} catch (error) {
			console.error("Failed to fetch project structure:", error);
			return { error: "Failed to fetch project structure" };
		}
	});
}

export async function saveProjectStructure(
	projectId: string,
	structureText: string,
) {
	return withProjectAuth(projectId, async () => {
		try {
			let [outline] = await db.query.outline.findMany({
				where: (outline, { eq }) => eq(outline.projectId, projectId),
				limit: 1,
			});

			if (!outline) {
				const [newOutline] = await db
					.insert(schema.outline)
					.values({
						projectId,
						title: "Main Outline",
						pov: "Third Person",
						tone: "Neutral",
						pacing: "Moderate",
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();
				outline = newOutline;
			}

			let [volume] = await db.query.volume.findMany({
				where: (volume, { eq }) => eq(volume.projectId, projectId),
				limit: 1,
			});

			if (!volume) {
				const [newVolume] = await db
					.insert(schema.volume)
					.values({
						projectId,
						outlineId: outline.id,
						title: "Volume 1",
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();
				volume = newVolume;
			}

			const lines = structureText.split("\n");
			const newStructure: {
				title: string;
				sequence: number;
				scenes: { title: string; sequence: number }[];
			}[] = [];

			let currentChapter: (typeof newStructure)[0] | null = null;
			let chapterSeq = 1;
			let sceneSeq = 1;

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;

				if (
					trimmed.toLowerCase().startsWith("chapter") ||
					(!trimmed.startsWith("-") && !trimmed.startsWith("*"))
				) {
					const title = trimmed.replace(/^chapter\s*\d*[:.]?\s*/i, "").trim();
					currentChapter = {
						title: title || `Chapter ${chapterSeq}`,
						sequence: chapterSeq++,
						scenes: [],
					};
					newStructure.push(currentChapter);
					sceneSeq = 1;
				} else if (currentChapter && (trimmed.startsWith("-") || trimmed.startsWith("*"))) {
					const title = trimmed.replace(/^[-*]\s*(scene:?)?\s*/i, "").trim();
					currentChapter.scenes.push({
						title: title || `Scene ${sceneSeq}`,
						sequence: sceneSeq++,
					});
				}
			}

			const existingChapters = await db.query.chapter.findMany({
				where: (c, { eq }) => eq(c.projectId, projectId),
			});

			const processedChapterIds = new Set<string>();

			for (const newCh of newStructure) {
				let chapterId: string;

				const existingCh = existingChapters.find(
					(c) => c.title.toLowerCase() === newCh.title.toLowerCase()
				);

				if (existingCh) {
					await db
						.update(chapter)
						.set({
							sequence: newCh.sequence,
							updatedAt: new Date(),
						})
						.where(eq(chapter.id, existingCh.id));
					chapterId = existingCh.id;
					processedChapterIds.add(existingCh.id);
				} else {
					const [created] = await db
						.insert(chapter)
						.values({
							projectId,
							outlineId: outline.id,
							volumeId: volume.id,
							title: newCh.title,
							sequence: newCh.sequence,
							status: "planned",
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.returning();
					chapterId = created.id;
				}

				const existingScenes = await db.query.scene.findMany({
					where: (s, { eq }) => eq(s.chapterId, chapterId),
				});

				const processedSceneIds = new Set<string>();

				for (const newSc of newCh.scenes) {
					const existingSc = existingScenes.find(
						(s) => s.title.toLowerCase() === newSc.title.toLowerCase()
					);

					if (existingSc) {
						await db
							.update(scene)
							.set({
								sequence: newSc.sequence,
								updatedAt: new Date(),
							})
							.where(eq(scene.id, existingSc.id));
						processedSceneIds.add(existingSc.id);
					} else {
						await db
							.insert(scene)
							.values({
								projectId,
								chapterId,
								title: newSc.title,
								sequence: newSc.sequence,
								status: "planned",
								createdAt: new Date(),
								updatedAt: new Date(),
							});
					}
				}

				for (const s of existingScenes) {
					if (!processedSceneIds.has(s.id)) {
						await db.delete(scene).where(eq(scene.id, s.id));
					}
				}
			}

			for (const c of existingChapters) {
				if (!processedChapterIds.has(c.id)) {
					await db.delete(scene).where(eq(scene.chapterId, c.id));
					await db.delete(chapter).where(eq(chapter.id, c.id));
				}
			}

			revalidatePath(`/projects/${projectId}/generate`);
			return { success: true };
		} catch (error) {
			console.error("Failed to save structure:", error);
			return { error: "Failed to save structure" };
		}
	});
}

export async function generateSceneContent(
	sceneId: string,
	prompt: string,
) {
	return withSceneAuth(sceneId, async (userId, targetScene) => {
		try {
			const project = await getProjectByIdWithAccess({
				id: targetScene.projectId,
				userId,
			});

			if (!project) return { error: "Project not found" };

			const { text } = await generateText({
				model: openai("gpt-4o"),
				system: `You are an expert fiction writer. Write a scene based on the user's prompt.
						 Context: Project '${project.name}'.
						 Adhere to the project's tone and style.`,
				prompt: `Scene ID: ${sceneId}\nPrompt: ${prompt}\n\nWrite the scene content:`,
			});

			return { success: true, content: text };
		} catch (error) {
			return { error: "Failed to generate content" };
		}
	});
}

export async function createChapterSnapshot(chapterId: string) {
	return withChapterAuth(chapterId, async () => {
		try {
			const scenes = await db
				.select()
				.from(scene)
				.where(eq(scene.chapterId, chapterId))
				.orderBy(scene.sequence);

			const fullContent = scenes
				.map((s) => s.content || "")
				.join("\n\n***\n\n");

			const [latestVersion] = await db
				.select()
				.from(chapterVersion)
				.where(eq(chapterVersion.chapterId, chapterId))
				.orderBy(desc(chapterVersion.version))
				.limit(1);

			const nextVersion = (latestVersion?.version || 0) + 1;

			await db.insert(chapterVersion).values({
				chapterId,
				content: fullContent,
				version: nextVersion,
				wordCount: fullContent.split(/\s+/).length,
				createdBy: "user",
				createdAt: new Date(),
			});

			return { success: true, version: nextVersion };
		} catch (error) {
			console.error("Failed to create snapshot:", error);
			return { error: "Failed to create snapshot" };
		}
	});
}

export async function updateSceneContent(sceneId: string, content: string) {
	return withSceneAuth(sceneId, async () => {
		try {
			await db
				.update(scene)
				.set({
					content,
					updatedAt: new Date(),
					status: "drafting",
				})
				.where(eq(scene.id, sceneId));

			return { success: true };
		} catch (error) {
			console.error("Failed to update scene content:", error);
			return { error: "Failed to update scene content" };
		}
	});
}
