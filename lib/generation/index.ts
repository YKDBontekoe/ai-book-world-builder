/**
 * Generation Module - Multi-agent book generation system
 */

export {
	type GenerationCallbacks,
	runGeneration,
} from "./generation-orchestrator";
export {
	generateRevisionGuidance,
	quickCheck,
	type ReviewerAgentInput,
	type ReviewResult,
	reviewChapter,
} from "./reviewer-agent";
export {
	generateChapter,
	generateEpilogue,
	generatePrologue,
	streamChapter,
	type WriterAgentInput,
	type WriterAgentOutput,
} from "./writer-agent";
