/**
 * Analysis Types (DEPRECATED)
 *
 * This file is maintained for backward compatibility.
 * Please import from "@/lib/ai/services" instead.
 *
 * @deprecated Use `import { DetectedEntity, EntityDetails, InferredRelationship } from "@/lib/ai/services"` instead
 */

export type {
	DetectedEntity,
	EntityDetails,
	EntityKind,
	InferredRelationship,
} from "@/lib/ai/services";

// Re-export AnalysisResult from book-analysis-service for backward compatibility
export type { AnalysisResult } from "@/lib/services/book-analysis-service";
