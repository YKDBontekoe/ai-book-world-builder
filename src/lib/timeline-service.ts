import { db } from "@/lib/db/drizzle";
import {
  type TimelineBranch,
  type TimelineNode,
  timelineBranch,
  timelineNode,
} from "@/lib/db/schema/timeline";
import { project } from "@/lib/db/schema/projects";
import { scene } from "@/lib/db/schema/scenes";
import { chapter, volume } from "@/lib/db/schema/outlines";
import { eq, and, asc, isNull } from "drizzle-orm";

export async function getGraphData(projectId: string) {
  // Ensure the main timeline is synced
  await syncCanonNodes(projectId);

  const branches = await db
    .select()
    .from(timelineBranch)
    .where(eq(timelineBranch.projectId, projectId));

  const nodes = await db
    .select()
    .from(timelineNode)
    .where(eq(timelineNode.projectId, projectId));

  return { branches, nodes };
}

export async function syncCanonNodes(projectId: string) {
  // 1. Check if a Main Timeline branch exists
  let mainBranch = await db.query.timelineBranch.findFirst({
    where: and(
      eq(timelineBranch.projectId, projectId),
      isNull(timelineBranch.parentBranchId)
    ),
  });

  if (!mainBranch) {
    const [newBranch] = await db
      .insert(timelineBranch)
      .values({
        name: "Main Timeline",
        projectId: projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    mainBranch = newBranch;
  }

  // 2. Fetch all existing scenes, ordered by sequence
  // We need to join with Chapter and Volume to get the global order
  const allScenes = await db
    .select({
      scene: scene,
      chapterSequence: chapter.sequence,
      sceneSequence: scene.sequence,
    })
    .from(scene)
    .innerJoin(chapter, eq(scene.chapterId, chapter.id))
    .innerJoin(volume, eq(chapter.volumeId, volume.id)) // Assuming volume exists
    .where(eq(scene.projectId, projectId))
    .orderBy(asc(chapter.sequence), asc(scene.sequence));

  // 3. For each scene, check if a node exists
  let previousNodeId: string | null = null;

  for (let i = 0; i < allScenes.length; i++) {
    const { scene: currentScene, chapterSequence, sceneSequence } = allScenes[i];

    const existingNode = await db.query.timelineNode.findFirst({
      where: and(
        eq(timelineNode.originalSceneId, currentScene.id),
        eq(timelineNode.projectId, projectId)
      ),
    });

    if (existingNode) {
      previousNodeId = existingNode.id;
      // Update links if necessary? For now, assume they are correct or we fix them.
      // Actually, if we re-order scenes in the canon, the graph might break.
      // For this task, we assume append-only or stable structure.
      continue;
    }

    // Create new node
    const insertedNodes: TimelineNode[] = await db
      .insert(timelineNode)
      .values({
        branchId: mainBranch.id,
        projectId: projectId,
        type: "canon",
        originalSceneId: currentScene.id,
        content: currentScene.content,
        summary: currentScene.title, // Use title as summary for now
        parentNodeId: previousNodeId,
        order: i, // Simplification
        depth: i,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (insertedNodes[0]) {
      previousNodeId = insertedNodes[0].id;
    }
  }
}

export async function createTimelineBranch({
  projectId,
  parentNodeId,
  decisionText,
  summary,
}: {
  projectId: string;
  parentNodeId: string;
  decisionText: string;
  summary: string;
}) {
  const parentNode = await db.query.timelineNode.findFirst({
    where: eq(timelineNode.id, parentNodeId),
  });

  if (!parentNode) throw new Error("Parent node not found");

  // Create new Branch
  const [newBranch] = await db
    .insert(timelineBranch)
    .values({
      projectId,
      name: decisionText, // Name the branch after the decision
      parentBranchId: parentNode.branchId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create the first node of this branch (the summary)
  const [newNode] = await db
    .insert(timelineNode)
    .values({
      projectId,
      branchId: newBranch.id,
      type: "divergent",
      summary: summary,
      parentNodeId: parentNodeId,
      depth: (parentNode.depth ?? 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

    // Update branch rootNodeId? We didn't add that column in schema.
    // The first node effectively acts as root.

  return { branch: newBranch, node: newNode };
}
