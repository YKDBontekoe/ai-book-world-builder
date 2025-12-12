"use server";

import { auth } from "@/app/(auth)/auth";
import { getSourceMaterialsForUser } from "@/lib/db/queries/source-material";
import {
	type AnalysisResult,
	bookAnalysisService,
} from "@/lib/services/book-analysis-service";

export type AnalyzeBookParams = {
	sourceMaterialId: string;
	projectId: string;
	extractRelationships?: boolean;
};

export type AnalyzeBookResponse =
	| { success: true; result: AnalysisResult }
	| { success: false; error: string };

/**
 * Server action to get source materials for a project
 */
export async function getSourceMaterialsForProject(projectId: string) {
	const session = await auth();

	if (!session?.user) {
		return [];
	}

	const materials = await getSourceMaterialsForUser({
		userId: session.user.id,
	});
	return materials.filter((m) => m.projectId === projectId);
}

/**
 * Server action to analyze an uploaded book and extract story elements
 */
export async function analyzeBook(
	params: AnalyzeBookParams,
): Promise<AnalyzeBookResponse> {
	const session = await auth();

	if (!session?.user) {
		return { success: false, error: "Authentication required" };
	}

	try {
		const result = await bookAnalysisService.analyzeBook({
			sourceMaterialId: params.sourceMaterialId,
			projectId: params.projectId,
			userId: session.user.id,
			extractRelationships: params.extractRelationships ?? true,
		});

		return { success: true, result };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Analysis failed",
		};
	}
}
