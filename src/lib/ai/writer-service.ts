import { generateText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { getSelectedModelId } from "@/lib/ai/models";

export interface GenerationOptions {
    modelId?: string;
    style?: string;
    temperature?: number;
}

export class GenerationService {
    /**
     * Continues writing a story based on context and previous content.
     */
    async continueWriting(
        context: string,
        previousContent: string,
        options: GenerationOptions = {}
    ) {
        try {
            const targetModel = options.modelId || await getSelectedModelId("large");

            const { text } = await generateText({
                model: myProvider.languageModel(targetModel),
                system: `You are an expert creative writing assistant. Your task is to continue the story seamlessly based on the provided text. Maintain the tone, style, and character voices. ${
                    options.style ? `Use a ${options.style} writing style.` : ""
                }`,
                prompt: `Context (Chapter/Scene info):\n${context}\n\nPrevious Text:\n${previousContent}\n\nContinue the story:`,
                temperature: options.temperature ?? 0.7,
            });

            return { text };
        } catch (error) {
            console.error("Writer AI Error:", error);
            return { error: "Failed to generate text" };
        }
    }

    /**
     * Drafts a scene from scratch using scene card details.
     */
    async draftScene(
        sceneTitle: string,
        cardData: { purpose: string; setting?: string; emotionalBeats?: string[] | string },
        instructions?: string,
        options: GenerationOptions = {}
    ) {
         try {
            const targetModel = options.modelId || await getSelectedModelId("large"); // Writer role usually uses large model

             const { text } = await generateText({
              model: myProvider.languageModel(targetModel),
              system: `You are The Writer. Your goal is to write compelling, high-quality prose.

            Write the scene based on the scene card and instructions.
            Output ONLY the story prose.
            `,
              prompt: `
            Scene Title: ${sceneTitle}
            Purpose: ${cardData.purpose}
            Setting: ${cardData.setting || "Not specified"}
            Emotional Beats: ${Array.isArray(cardData.emotionalBeats) ? cardData.emotionalBeats.join(", ") : (cardData.emotionalBeats || "None")}

            Instructions: ${instructions || "Draft the scene."}
            `,
            temperature: options.temperature ?? 0.7,
            });

            return { text };

         } catch (error) {
            console.error("Writer AI Error:", error);
            return { error: "Failed to draft scene" };
         }
    }

    async generateIdeas(
        context: string,
        currentText: string,
        options: GenerationOptions = {}
    ) {
        try {
            const targetModel = options.modelId || await getSelectedModelId("middle");

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

    async rewriteSelection(
        selection: string,
        instruction: string,
        options: GenerationOptions = {}
    ) {
        try {
            const targetModel = options.modelId || await getSelectedModelId("middle");

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
}

export const generationService = new GenerationService();
