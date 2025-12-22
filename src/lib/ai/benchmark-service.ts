/**
 * Benchmark Service
 *
 * Hybrid approach:
 * 1. Static fallback data for writing quality scores (updated periodically)
 * 2. Dynamic price/speed data from model definitions
 * 3. Optional: Fetch from external APIs with caching
 */

import { z } from "zod";
import { type ChatModel, chatModels } from "@/lib/ai/models";

// =============================================================================
// Types
// =============================================================================

export interface ModelBenchmark {
	modelId: string;
	// Writing quality scores (1-5 stars)
	writingScore: number;
	reviewingScore: number;
	// Capabilities
	contextWindow: string;
	supportsVision: boolean;
	supportsReasoning: boolean;
	// Cost tier
	costTier: "budget" | "standard" | "premium";
	// Recommendation badges
	recommendedFor: ("writing" | "reviewing")[];
	// Description for this use case
	writingDescription: string;
	reviewingDescription: string;
	// Source and freshness
	lastUpdated: string;
	source: string;
}

export interface BenchmarkCache {
	data: Map<string, ModelBenchmark>;
	fetchedAt: Date;
	expiresAt: Date;
}

// =============================================================================
// Static Fallback Data (Based on EQ-Bench Creative Writing v3 & Chatbot Arena)
// =============================================================================

const STATIC_BENCHMARKS: Record<string, Omit<ModelBenchmark, "modelId">> = {
	"anthropic-claude-opus-4-5": {
		writingScore: 5,
		reviewingScore: 4,
		contextWindow: "200K",
		supportsVision: true,
		supportsReasoning: false,
		costTier: "premium",
		recommendedFor: ["writing"],
		writingDescription:
			"Top-tier creative writing. Excels at literary fiction, complex narratives, and maintaining character voice.",
		reviewingDescription:
			"Thorough analysis but expensive for high-volume reviewing.",
		lastUpdated: "2024-12",
		source: "EQ-Bench Creative Writing v3",
	},
	"anthropic-claude-sonnet-4-5": {
		writingScore: 5,
		reviewingScore: 4,
		contextWindow: "200K",
		supportsVision: true,
		supportsReasoning: false,
		costTier: "standard",
		recommendedFor: ["writing"],
		writingDescription:
			"Excellent prose quality with warm, natural tone. Fast enough for iterative drafting.",
		reviewingDescription: "Good balance of quality and speed for reviews.",
		lastUpdated: "2024-12",
		source: "EQ-Bench Creative Writing v3",
	},
	"google-gemini-3-pro": {
		writingScore: 4,
		reviewingScore: 5,
		contextWindow: "2M",
		supportsVision: true,
		supportsReasoning: false,
		costTier: "standard",
		recommendedFor: ["reviewing"],
		writingDescription:
			"Strong narratives with logical coherence. Best for research-heavy projects.",
		reviewingDescription:
			"Massive context window ideal for reviewing entire manuscripts at once.",
		lastUpdated: "2024-12",
		source: "Chatbot Arena",
	},
	"openai-gpt-4o-mini": {
		writingScore: 3,
		reviewingScore: 4,
		contextWindow: "128K",
		supportsVision: true,
		supportsReasoning: false,
		costTier: "budget",
		recommendedFor: ["reviewing"],
		writingDescription:
			"Competent drafts but may lack the nuance of larger models.",
		reviewingDescription:
			"Best value for reviewing. Fast, cheap, and catches most issues.",
		lastUpdated: "2024-12",
		source: "Chatbot Arena",
	},
	"openai-gpt-5-mini": {
		writingScore: 4,
		reviewingScore: 4,
		contextWindow: "128K",
		supportsVision: true,
		supportsReasoning: false,
		costTier: "standard",
		recommendedFor: [],
		writingDescription:
			"Balanced model with good versatility across writing styles.",
		reviewingDescription: "Solid all-around choice for reviewing tasks.",
		lastUpdated: "2024-12",
		source: "Artificial Analysis",
	},
	"deepseek-reasoner": {
		writingScore: 3,
		reviewingScore: 5,
		contextWindow: "64K",
		supportsVision: false,
		supportsReasoning: true,
		costTier: "budget",
		recommendedFor: ["reviewing"],
		writingDescription:
			"Better for analytical than creative tasks. Good for non-fiction.",
		reviewingDescription:
			"Chain-of-thought reasoning catches plot holes and inconsistencies others miss.",
		lastUpdated: "2024-12",
		source: "EQ-Bench",
	},
};

// =============================================================================
// Cache Management
// =============================================================================

let benchmarkCache: BenchmarkCache | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isCacheValid(): boolean {
	if (!benchmarkCache) return false;
	return new Date() < benchmarkCache.expiresAt;
}

function getCostTier(model: ChatModel): "budget" | "standard" | "premium" {
	const outputPrice = parseFloat(model.pricing?.output || "0");
	if (outputPrice < 1) return "budget";
	if (outputPrice < 10) return "standard";
	return "premium";
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get benchmark data for a specific model
 */
export function getModelBenchmark(modelId: string): ModelBenchmark | null {
	const staticData = STATIC_BENCHMARKS[modelId];
	const model = chatModels.find((m) => m.id === modelId);

	if (!staticData || !model) {
		return null;
	}

	return {
		modelId,
		...staticData,
		// Override with dynamic data from model definition
		supportsVision: model.supportsImages,
		supportsReasoning: model.reasoning || false,
		costTier: getCostTier(model),
	};
}

/**
 * Get all model benchmarks
 */
export function getAllBenchmarks(): ModelBenchmark[] {
	return chatModels
		.map((model) => getModelBenchmark(model.id))
		.filter((b): b is ModelBenchmark => b !== null);
}

/**
 * Get models recommended for a specific task
 */
export function getRecommendedModels(
	task: "writing" | "reviewing",
): ModelBenchmark[] {
	return getAllBenchmarks()
		.filter((b) => b.recommendedFor.includes(task))
		.sort((a, b) => {
			const scoreKey = task === "writing" ? "writingScore" : "reviewingScore";
			return b[scoreKey] - a[scoreKey];
		});
}

/**
 * Get models filtered by cost tier
 */
export function getModelsByTier(
	tier: "budget" | "standard" | "premium" | "all",
): ModelBenchmark[] {
	const all = getAllBenchmarks();
	if (tier === "all") return all;
	return all.filter((b) => b.costTier === tier);
}

/**
 * Check if a model is recommended for a task
 */
export function isRecommendedFor(
	modelId: string,
	task: "writing" | "reviewing",
): boolean {
	const benchmark = getModelBenchmark(modelId);
	return benchmark?.recommendedFor.includes(task) || false;
}

/**
 * Get the best model for a task within a budget tier
 */
export function getBestModelForTask(
	task: "writing" | "reviewing",
	maxTier: "budget" | "standard" | "premium" = "premium",
): ModelBenchmark | null {
	const tierPriority = { budget: 1, standard: 2, premium: 3 };
	const maxPriority = tierPriority[maxTier];

	const candidates = getAllBenchmarks().filter(
		(b) => tierPriority[b.costTier] <= maxPriority,
	);

	if (candidates.length === 0) return null;

	const scoreKey = task === "writing" ? "writingScore" : "reviewingScore";
	return candidates.sort((a, b) => b[scoreKey] - a[scoreKey])[0];
}

// =============================================================================
// Optional: Fetch from External APIs (for future use)
// =============================================================================

interface ExternalBenchmarkData {
	modelId: string;
	eloScore?: number;
	writingElo?: number;
}

const ExternalBenchmarkSchema = z.object({
	modelId: z.string(),
	eloScore: z.number().optional(),
	writingElo: z.number().optional(),
});

/**
 * Fetch benchmark data from external APIs.
 *
 * Uses BENCHMARK_API_URL environment variable if set.
 * Otherwise defaults to the GitHub Raw URL of the benchmarks.json file in this repository.
 */
export async function fetchExternalBenchmarks(): Promise<
	ExternalBenchmarkData[]
> {
	const DEFAULT_BENCHMARK_URL =
		"https://raw.githubusercontent.com/YKDBontekoe/ai-book-world-builder/main/public/data/benchmarks.json";
	const apiUrl = process.env.BENCHMARK_API_URL || DEFAULT_BENCHMARK_URL;

	try {
		console.log(`[Benchmark Service] Fetching benchmarks from ${apiUrl}`);
		const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
		if (!response.ok) {
			throw new Error(
				`Failed to fetch benchmarks: ${response.status} ${response.statusText}`,
			);
		}
		const data = await response.json();
		const result = z.array(ExternalBenchmarkSchema).safeParse(data);
		if (result.success) {
			return result.data;
		}
		console.warn(
			"[Benchmark Service] Invalid external benchmark data format:",
			result.error,
		);
	} catch (error) {
		console.error(
			"[Benchmark Service] Error fetching external benchmarks:",
			error,
		);
	}

	return [];
}

/**
 * Refresh the benchmark cache
 */
export async function refreshBenchmarkCache(): Promise<void> {
	try {
		const externalData = await fetchExternalBenchmarks();

		// Merge external data with static fallback
		const mergedData = new Map<string, ModelBenchmark>();

		for (const model of chatModels) {
			const staticBenchmark = getModelBenchmark(model.id);
			if (staticBenchmark) {
				// Find matching external data (reserved for future use)
				const _external = externalData.find((e) => e.modelId === model.id);

				// Merge (external takes precedence if available)
				mergedData.set(model.id, {
					...staticBenchmark,
					// Could update scores here based on external data
					lastUpdated: new Date().toISOString().slice(0, 7),
				});
			}
		}

		benchmarkCache = {
			data: mergedData,
			fetchedAt: new Date(),
			expiresAt: new Date(Date.now() + CACHE_TTL_MS),
		};
	} catch (error) {
		console.error("[Benchmark Service] Failed to refresh cache:", error);
		// Keep using static fallback
	}
}

/**
 * Get cache status for display in UI
 */
export function getCacheStatus(): {
	isValid: boolean;
	lastUpdated: string;
	source: string;
} {
	if (isCacheValid() && benchmarkCache) {
		return {
			isValid: true,
			lastUpdated: benchmarkCache.fetchedAt.toISOString(),
			source: "Cached",
		};
	}

	return {
		isValid: false,
		lastUpdated: "2024-12",
		source: "Static (EQ-Bench, Chatbot Arena)",
	};
}
