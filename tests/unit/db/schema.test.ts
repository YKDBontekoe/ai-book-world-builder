import type { InferSelectModel } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
	bookExport,
	bookGeneration,
	bookGenerationStep,
	chapter,
	generationTemplate,
	sourceMaterialProcessing,
	type Vote,
	vote,
} from "@/lib/db/schema";

describe("db schema barrel", () => {
	it("exports hydrated tables with expected foreign keys", () => {
		const voteConfig = getTableConfig(vote);

		expect(voteConfig.name).toBe("Vote_v2");
		expect(voteConfig.foreignKeys).toHaveLength(2);
		expect(voteConfig.primaryKeys).toHaveLength(1);
	});

	it("retains source material processing indexes", () => {
		const processingIndexes = getTableConfig(
			sourceMaterialProcessing,
		).indexes.map((idx) => ({
			name: idx.config.name,
			unique: idx.config.unique,
		}));

		expect(processingIndexes).toContainEqual({
			name: "source_material_processing_material_idx",
			unique: true,
		});
		expect(processingIndexes).toContainEqual({
			name: "source_material_processing_project_idx",
			unique: false,
		});
	});

	it("preserves outline sequencing guarantees", () => {
		const chapterIndexes = getTableConfig(chapter).indexes.map((idx) => ({
			name: idx.config.name,
			unique: idx.config.unique,
		}));

		expect(chapterIndexes).toContainEqual({
			name: "chapter_sequence_volume_idx",
			unique: true,
		});
	});

	it("keeps generation pipeline constraints", () => {
		const generationIndexes = getTableConfig(bookGeneration).indexes.map(
			(idx) => ({ name: idx.config.name, unique: idx.config.unique }),
		);
		const stepIndexes = getTableConfig(bookGenerationStep).indexes.map(
			(idx) => idx.config.name,
		);

		expect(generationIndexes).toContainEqual({
			name: "book_generation_project_idx",
			unique: true,
		});
		expect(stepIndexes).toEqual(
			expect.arrayContaining([
				"book_generation_step_generation_idx",
				"book_generation_step_sequence_idx",
			]),
		);
	});

	it("exposes export and template indexes", () => {
		const exportIndexes = getTableConfig(bookExport).indexes.map(
			(idx) => idx.config.name,
		);
		const templateIndexes = getTableConfig(generationTemplate).indexes.map(
			(idx) => idx.config.name,
		);

		expect(exportIndexes).toEqual(
			expect.arrayContaining([
				"book_export_project_idx",
				"book_export_user_idx",
			]),
		);
		expect(templateIndexes).toEqual(
			expect.arrayContaining(["generation_template_user_idx"]),
		);
	});

	it("continues to provide typed exports via the barrel", () => {
		expectTypeOf<Vote>().toEqualTypeOf<InferSelectModel<typeof vote>>();
	});
});
