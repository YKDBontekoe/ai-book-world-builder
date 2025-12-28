/**
 * Writer Agent - Generates chapter content based on project context and settings
 */

import { generateText, streamText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { GenerationSettings } from "@/lib/db/schema";

export interface WriterAgentInput {
	chapterNumber: number;
	chapterTitle: string;
	previousChapterSummary?: string;
	projectContext: string;
	loreContext: string;
	outlineContent: string;
	userNotes: string[];
	settings: GenerationSettings;
}

import type { LanguageModelUsage } from "ai";

export interface WriterAgentOutput {
	content: string;
	wordCount: number;
	tokenCount?: number;
	usage?: LanguageModelUsage & { modelId?: string };
}

/**
 * Get the writing style prompt based on settings
 */
function getStylePrompt(settings: GenerationSettings): string {
	const styleDescriptions: Record<string, string> = {
		hemingway:
			"Write in the style of Ernest Hemingway: sparse, direct prose with short sentences, minimal adjectives, and understated emotion.",
		tolkien:
			"Write in the style of J.R.R. Tolkien: rich, descriptive worldbuilding with elegant prose, detailed landscapes, and a sense of epic grandeur.",
		king: "Write in the style of Stephen King: character-driven with suspenseful pacing, vivid descriptions, and a conversational narrative voice that draws readers in.",
		rowling:
			"Write in the style of J.K. Rowling: whimsical yet grounded, with clever wordplay, memorable characters, and accessible yet engaging prose.",
		sanderson:
			"Write in the style of Brandon Sanderson: systematic magic, clear prose, epic scope with detailed worldbuilding, and satisfying plot payoffs.",
		custom:
			settings.customStyleDescription ||
			"Write in a professional, engaging style.",
	};

	let stylePrompt =
		styleDescriptions[settings.writingStylePreset] || styleDescriptions.custom;

	if (settings.authorInspirations && settings.authorInspirations.length > 0) {
		stylePrompt += `\n\nDraw inspiration from these authors: ${settings.authorInspirations.join(", ")}.`;
	}

	return stylePrompt;
}

/**
 * Calculate target word count based on pages per chapter
 */
function getTargetWordCount(settings: GenerationSettings): number {
	// Approximately 250 words per page
	return settings.pagesPerChapter * 250;
}

/**
 * Generate a chapter using the Writer Agent
 */
export async function generateChapter(
	input: WriterAgentInput,
): Promise<WriterAgentOutput> {
	const targetWords = getTargetWordCount(input.settings);
	const stylePrompt = getStylePrompt(input.settings);

	const systemPrompt = `You are a professional novelist writing ${input.settings.genre || "fiction"}.
${stylePrompt}

## Writing Guidelines
- Target approximately ${targetWords} words for this chapter
- Maintain consistency with the established world and characters
- End on a compelling note that encourages continued reading
- Show, don't tell - use vivid scenes and dialogue
- Advance the plot while developing characters

## Project Context
${input.projectContext}

## World/Lore
${input.loreContext}

## Story Outline
${input.outlineContent}

${input.previousChapterSummary ? `## Previous Chapter Summary\n${input.previousChapterSummary}` : ""}

${input.userNotes.length > 0 ? `## Author Notes to Incorporate\n${input.userNotes.join("\n")}` : ""}`;

	const userPrompt = `Write Chapter ${input.chapterNumber}: "${input.chapterTitle}"

Create an engaging, complete chapter that:
1. Follows the story outline
2. Uses consistent character voices and world details
3. Advances the plot meaningfully
4. Is approximately ${targetWords} words

Begin writing the chapter now:`;

	const response = await generateText({
		model: myProvider.languageModel(input.settings.writerModelId),
		system: systemPrompt,
		prompt: userPrompt,
	});

	const content = response.text;
	const wordCount = content.split(/\s+/).length;

	return {
		content,
		wordCount,
		tokenCount: response.usage?.totalTokens,
		usage: { ...response.usage, modelId: input.settings.writerModelId },
	};
}

/**
 * Stream a chapter generation for real-time feedback
 */
export async function streamChapter(
	input: WriterAgentInput,
	onChunk: (chunk: string) => void,
): Promise<WriterAgentOutput> {
	const targetWords = getTargetWordCount(input.settings);
	const stylePrompt = getStylePrompt(input.settings);

	const systemPrompt = `You are a professional novelist writing ${input.settings.genre || "fiction"}.
${stylePrompt}

## Project Context
${input.projectContext}

## World/Lore
${input.loreContext}

${input.previousChapterSummary ? `## Previous Chapter\n${input.previousChapterSummary}` : ""}`;

	const userPrompt = `Write Chapter ${input.chapterNumber}: "${input.chapterTitle}"
Target: ~${targetWords} words. Create an engaging, complete chapter.`;

	const stream = streamText({
		model: myProvider.languageModel(input.settings.writerModelId),
		system: systemPrompt,
		prompt: userPrompt,
	});

	let fullContent = "";

	for await (const chunk of (await stream).textStream) {
		fullContent += chunk;
		onChunk(chunk);
	}

	return {
		content: fullContent,
		wordCount: fullContent.split(/\s+/).length,
	};
}

/**
 * Generate a prologue
 */
export async function generatePrologue(
	projectContext: string,
	loreContext: string,
	settings: GenerationSettings,
): Promise<WriterAgentOutput> {
	const stylePrompt = getStylePrompt(settings);
	const targetWords = Math.min(settings.pagesPerChapter * 250, 2000);

	const response = await generateText({
		model: myProvider.languageModel(settings.writerModelId),
		system: `You are a professional novelist. ${stylePrompt}
Write an engaging prologue that hooks the reader and sets up the story.`,
		prompt: `Project Context:\n${projectContext}\n\nWorld:\n${loreContext}\n\nWrite a compelling prologue (~${targetWords} words).`,
	});

	return {
		content: response.text,
		wordCount: response.text.split(/\s+/).length,
		tokenCount: response.usage?.totalTokens,
		usage: { ...response.usage, modelId: settings.writerModelId },
	};
}

/**
 * Generate an epilogue
 */
export async function generateEpilogue(
	projectContext: string,
	_loreContext: string,
	previousChaptersSummary: string,
	settings: GenerationSettings,
): Promise<WriterAgentOutput> {
	const stylePrompt = getStylePrompt(settings);
	const targetWords = Math.min(settings.pagesPerChapter * 250, 2000);

	const response = await generateText({
		model: myProvider.languageModel(settings.writerModelId),
		system: `You are a professional novelist. ${stylePrompt}
Write a satisfying epilogue that provides closure while leaving room for reader imagination.`,
		prompt: `Project Context:\n${projectContext}\n\nStory Summary:\n${previousChaptersSummary}\n\nWrite a compelling epilogue (~${targetWords} words).`,
	});

	return {
		content: response.text,
		wordCount: response.text.split(/\s+/).length,
		tokenCount: response.usage?.totalTokens,
		usage: { ...response.usage, modelId: settings.writerModelId },
	};
}
