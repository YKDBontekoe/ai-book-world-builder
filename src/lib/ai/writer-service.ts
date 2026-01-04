/**
 * Writer Service (DEPRECATED)
 *
 * This file is maintained for backward compatibility.
 * Please import from "@/lib/ai/services" instead.
 *
 * @deprecated Use `import { generationService } from "@/lib/ai/services"` instead
 */

// Re-export with old name for full backward compatibility
export {
	type GenerationOptions,
	GenerationService,
	generationService,
	generationService as writerService,
} from "@/lib/ai/services/generation-service";
