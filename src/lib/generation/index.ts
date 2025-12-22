/**
 * Generation Module - Multi-agent book generation system
 */

export {
	type GenerationCallbacks,
	runGeneration,
} from "@/lib/generation/generation-orchestrator";
export {
	generateRevisionGuidance,
	quickCheck,
	type ReviewerAgentInput,
	type ReviewResult,
	reviewChapter,
} from "@/lib/generation/reviewer-agent";
export {
	generateChapter,
	generateEpilogue,
	generatePrologue,
	streamChapter,
	type WriterAgentInput,
	type WriterAgentOutput,
} from "@/lib/generation/writer-agent";
