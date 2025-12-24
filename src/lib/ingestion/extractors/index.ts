import { docxExtractor } from "@/lib/ingestion/extractors/docx";
import { epubExtractor } from "@/lib/ingestion/extractors/epub";
import { pdfExtractor } from "@/lib/ingestion/extractors/pdf";
import { plainTextExtractor } from "@/lib/ingestion/extractors/plain-text";
import { supportedIngestionMimeTypes } from "@/lib/ingestion/mime-types";
import type {
	ExtractionStrategy,
	SourceMaterialExtractor,
} from "@/lib/ingestion/types";

export class ExtractorRegistry {
	private readonly strategies: Map<string, SourceMaterialExtractor>;

	constructor(strategies?: Map<string, SourceMaterialExtractor>) {
		this.strategies = strategies ?? new Map();
	}

	register(strategy: ExtractionStrategy): void {
		strategy.mimeTypes.forEach((mimeType) => {
			this.strategies.set(mimeType.toLowerCase(), strategy);
		});
	}

	resolve(mimeType: string): SourceMaterialExtractor {
		const normalized = mimeType.toLowerCase();

		if (!supportedIngestionMimeTypes.has(normalized)) {
			throw new Error(`Unsupported MIME type: ${normalized}`);
		}

		const strategy = this.strategies.get(normalized);
		if (!strategy) {
			throw new Error(`No extractor registered for MIME type: ${normalized}`);
		}

		return strategy;
	}
}

export function createDefaultExtractorRegistry(): ExtractorRegistry {
	const registry = new ExtractorRegistry();
	[pdfExtractor, epubExtractor, docxExtractor, plainTextExtractor].forEach(
		(strategy) => registry.register(strategy),
	);

	return registry;
}

export { pdfExtractor, epubExtractor, docxExtractor, plainTextExtractor };
