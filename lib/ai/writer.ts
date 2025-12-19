"use server";

import { generateText } from "ai";
import { myProvider } from "./providers";
import { DEFAULT_CHAT_MODEL } from "./models";

// Default fallback if no model is provided or found in cookies
const DEFAULT_WRITER_MODEL = DEFAULT_CHAT_MODEL;

export async function continueWriting(
	context: string,
	previousContent: string,
	options: { modelId?: string; style?: string } = {}
) {
	try {
		const targetModel = options.modelId || DEFAULT_WRITER_MODEL;

		const { text } = await generateText({
			model: myProvider.languageModel(targetModel),
			system: `You are an expert creative writing assistant. Your task is to continue the story seamlessly based on the provided text. Maintain the tone, style, and character voices. ${
				options.style ? `Use a ${options.style} writing style.` : ""
			}`,
			prompt: `Context (Chapter/Scene info):\n${context}\n\nPrevious Text:\n${previousContent}\n\nContinue the story:`,
			temperature: 0.7,
		});

		return { text };
	} catch (error) {
		console.error("Writer AI Error:", error);
		return { error: "Failed to generate text" };
	}
}

export async function generateIdeas(
	context: string,
	currentText: string,
	options: { modelId?: string } = {}
) {
	try {
		const targetModel = options.modelId || DEFAULT_WRITER_MODEL;

		const { text } = await generateText({
			model: myProvider.languageModel(targetModel),
			system:
				"You are a creative writing coach. Provide 3 distinct and interesting options for what could happen next in the story.",
			prompt: `Context:\n${context}\n\nCurrent Text:\n${currentText}\n\nSuggest 3 plot developments:`,
		});

		return { ideas: text };
	} catch (error) {
		console.error("Writer AI Error:", error);
		return { error: "Failed to generate ideas" };
	}
}

export async function rewriteSelection(
	selection: string,
	instruction: string,
	options: { modelId?: string } = {}
) {
	try {
		const targetModel = options.modelId || DEFAULT_WRITER_MODEL;

		const { text } = await generateText({
			model: myProvider.languageModel(targetModel),
			system:
				"You are an expert editor. Rewrite the selected text according to the user's instruction. Output ONLY the rewritten text, no explanations.",
			prompt: `Original Text:\n"${selection}"\n\nInstruction: ${instruction}\n\nRewritten Text:`,
		});

		return { text };
	} catch (error) {
		console.error("Writer AI Error:", error);
		return { error: "Failed to rewrite text" };
	}
}
