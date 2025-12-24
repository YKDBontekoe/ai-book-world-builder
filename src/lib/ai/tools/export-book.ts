import { tool } from "ai";
import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import { z } from "zod";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import { bookExport } from "@/lib/db/schema";
import { exportBook as exportBookService } from "@/lib/services/book-exporter";

export const exportBook = ({
	session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description: "Export the current book/project as a PDF or EPUB file.",
		inputSchema: z.object({
			format: z
				.enum(["pdf", "epub"])
				.default("pdf")
				.describe("The format to export the book in."),
			projectId: z
				.string()
				.optional()
				.describe(
					"The ID of the project to export. If not provided, will use the current context.",
				),
		}),
		execute: async (args: any) => {
			const { format, projectId: projectIdInput } = args;
			const finalProjectId = projectIdInput || projectId;

			if (!session?.user?.id) {
				return { error: "User must be logged in to export a book." };
			}

			if (!finalProjectId) {
				return { error: "Project ID is required to export." };
			}

			try {
				// Get project data
				const projectData = await getFullProjectDataForGeneration({
					projectId: finalProjectId,
					userId: session.user.id,
				});

				if (!projectData) {
					return { error: "Project not found." };
				}

				// Create pending export record
				const [exportRecord] = await db
					.insert(bookExport)
					.values({
						projectId: finalProjectId,
						format,
						status: "pending",
						userId: session.user.id,
						createdAt: new Date(),
					})
					.returning();

				try {
					const result = await exportBookService(projectData, format);

					// Update export record with URL
					await db
						.update(bookExport)
						.set({
							blobUrl: result.url,
							status: "completed",
						})
						.where(eq(bookExport.id, exportRecord.id));

					return {
						message: `Book exported successfully as ${format.toUpperCase()}.`,
						url: result.url,
						filename: result.filename,
					};
				} catch (exportError) {
					// Update export record with error
					await db
						.update(bookExport)
						.set({
							status: "failed",
							error:
								exportError instanceof Error
									? exportError.message
									: "Unknown error",
						})
						.where(eq(bookExport.id, exportRecord.id));

					throw exportError;
				}
			} catch (error) {
				return {
					error: `Failed to export book: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
