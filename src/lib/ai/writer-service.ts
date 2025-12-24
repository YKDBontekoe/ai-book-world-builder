/**
 * Writer Service (DEPRECATED)
 *
 * This file is maintained for backward compatibility.
 * Please import from "@/lib/ai/services" instead.
 *
 * @deprecated Use `import { generationService } from "@/lib/ai/services"` instead
 */

export {
	GenerationService,
	generationService,
	type GenerationOptions,
} from "@/lib/ai/services/generation-service";

// Re-export with old name for full backward compatibility
export { generationService as writerService } from "@/lib/ai/services/generation-service";
