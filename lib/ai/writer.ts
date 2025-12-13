"use server";

import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

// Initialize providers
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const WRITER_MODEL = "gpt-4o"; // Or 'claude-3-5-sonnet-20240620'

export async function continueWriting(
  context: string,
  previousContent: string,
  style?: string
) {
  try {
    const { text } = await generateText({
      model: openai(WRITER_MODEL),
      system: `You are an expert creative writing assistant. Your task is to continue the story seamlessly based on the provided text. Maintain the tone, style, and character voices. ${
        style ? `Use a ${style} writing style.` : ""
      }`,
      prompt: `Context (Chapter/Scene info):\n${context}\n\nPrevious Text:\n${previousContent}\n\nContinue the story:`,
      temperature: 0.7,
      maxTokens: 500,
    });

    return { text };
  } catch (error) {
    console.error("Writer AI Error:", error);
    return { error: "Failed to generate text" };
  }
}

export async function generateIdeas(context: string, currentText: string) {
  try {
    const { text } = await generateText({
      model: openai(WRITER_MODEL),
      system: "You are a creative writing coach. Provide 3 distinct and interesting options for what could happen next in the story.",
      prompt: `Context:\n${context}\n\nCurrent Text:\n${currentText}\n\nSuggest 3 plot developments:`,
    });

    return { ideas: text };
  } catch (error) {
    console.error("Writer AI Error:", error);
    return { error: "Failed to generate ideas" };
  }
}

export async function rewriteSelection(selection: string, instruction: string) {
  try {
    const { text } = await generateText({
      model: openai(WRITER_MODEL),
      system: "You are an expert editor. Rewrite the selected text according to the user's instruction. Output ONLY the rewritten text, no explanations.",
      prompt: `Original Text:\n"${selection}"\n\nInstruction: ${instruction}\n\nRewritten Text:`,
    });

    return { text };
  } catch (error) {
    console.error("Writer AI Error:", error);
    return { error: "Failed to rewrite text" };
  }
}
