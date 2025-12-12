import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getSourceMaterialById } from "@/lib/db/queries";
import { bookAnalysisService } from "@/lib/services/book-analysis-service";

export const analyzeBook = ({
	session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description:
			"Analyze an uploaded book (source material) to extract characters, locations, organizations, and relationships. Use this to import story elements as inspiration for creating spin-offs or derivative works.",
		inputSchema: z.object({
			sourceMaterialId: z
				.string()
				.describe("The ID of the uploaded source material (book) to analyze"),
			extractRelationships: z
				.boolean()
				.default(true)
				.describe(
					"Whether to also analyze and create relationships between characters",
				),
		}),
		execute: async (args) => {
			const { sourceMaterialId, extractRelationships } = args;

			if (!session?.user) {
				return { error: "Authentication required to analyze a book." };
			}

			if (!projectId) {
				return { error: "Project context is required to analyze a book." };
			}

			try {
				// Verify the source material exists
				const material = await getSourceMaterialById({ id: sourceMaterialId });

				if (!material?.material) {
					return {
						error: `Source material with ID "${sourceMaterialId}" not found.`,
					};
				}

				if (material.material.status !== "processed") {
					return {
						error: `Source material "${material.material.filename}" is not ready for analysis. Current status: ${material.material.status}. Please wait for processing to complete.`,
					};
				}

				// Run the analysis
				const result = await bookAnalysisService.analyzeBook({
					sourceMaterialId,
					projectId,
					userId: session.user.id,
					extractRelationships,
				});

				return {
					message: `Analysis complete for "${material.material.filename}"!`,
					summary: {
						chunksAnalyzed: result.stats.chunksAnalyzed,
						entitiesDetected: result.stats.entitiesDetected,
						entitiesCreated: result.stats.entitiesCreated,
						relationshipsCreated: result.stats.relationshipsCreated,
					},
					createdEntities: result.entities.map((e) => ({
						id: e.id,
						name: e.name,
						kind: e.kind,
						summary:
							e.summary?.slice(0, 100) +
							(e.summary && e.summary.length > 100 ? "..." : ""),
					})),
					createdRelationships: result.relationships.map((r) => ({
						type: r.type,
						sourceId: r.sourceId,
						targetId: r.targetId,
					})),
				};
			} catch (error) {
				return {
					error: `Failed to analyze book: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
