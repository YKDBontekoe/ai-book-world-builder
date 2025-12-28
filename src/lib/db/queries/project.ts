import "server-only";
import { and, desc, eq, ne, or } from "drizzle-orm";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { DEFAULT_PROJECT_FOLDERS } from "@/lib/constants";
import { db } from "@/lib/db/drizzle";
import { type Project, project } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function createProject({
	name,
	description,
	visibility,
	userId,
}: {
	name: string;
	description?: string;
	visibility: VisibilityType;
	userId: string;
}): Promise<Project> {
	try {
		const folders = DEFAULT_PROJECT_FOLDERS.map((folder) => ({ ...folder }));

		const [createdProject] = await db
			.insert(project)
			.values({
				name,
				description,
				visibility,
				userId,
				createdAt: new Date(),
				folders,
			})
			.returning();

		return createdProject;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError("bad_request:database", "Failed to create project");
	}
}

export async function getProjectsVisibleToUser({
	userId,
	filter = "all",
}: {
	userId: string;
	filter?: "all" | "mine" | "shared";
}): Promise<Project[]> {
	try {
		let whereClause: any;

		if (filter === "mine") {
			whereClause = eq(project.userId, userId);
		} else if (filter === "shared") {
			whereClause = and(
				eq(project.visibility, "public"),
				ne(project.userId, userId),
			);
		} else {
			whereClause = or(
				eq(project.userId, userId),
				eq(project.visibility, "public"),
			);
		}

		return await db
			.select()
			.from(project)
			.where(whereClause)
			.orderBy(desc(project.createdAt));
	} catch (error) {
		console.error(error);
		throw new ChatSDKError("bad_request:database", "Failed to list projects");
	}
}

export async function getProjectByIdWithAccess({
	id,
	userId,
}: {
	id: string;
	userId?: string;
}): Promise<Project | null> {
	try {
		const [selectedProject] = await db
			.select()
			.from(project)
			.where(eq(project.id, id));

		if (!selectedProject) {
			return null;
		}

		if (
			selectedProject.visibility === "private" &&
			selectedProject.userId !== userId
		) {
			return null;
		}

		return selectedProject;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load project by id",
		);
	}
}
