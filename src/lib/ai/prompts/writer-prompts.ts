export interface ContinueWritingPromptParams {
	context: string;
	previousContent: string;
}

export interface DraftScenePromptParams {
	sceneTitle: string;
	purpose: string;
	setting?: string;
	emotionalBeats?: string;
	instructions?: string;
}

export interface GenerateIdeasPromptParams {
	context: string;
	currentText: string;
}

export interface RewriteSelectionPromptParams {
	selection: string;
	instruction: string;
}

export interface CoAuthorAlternativesPromptParams {
	selection: string;
	guidance?: string;
}

export const writerPrompts = {
	continueWriting: {
		system: (style?: string) =>
			`You are an expert creative writing assistant. Your task is to continue the story seamlessly based on the provided text. Maintain the tone, style, and character voices. ${
				style ? `Use a ${style} writing style.` : ""
			}`,
		user: ({ context, previousContent }: ContinueWritingPromptParams) =>
			`Context (Chapter/Scene info):\n${context || "Not provided"}\n\nPrevious Text:\n${previousContent || "None"}\n\nContinue the story:`,
	},

	draftScene: {
		system: () =>
			`You are The Writer. Your goal is to write compelling, high-quality prose.

Write the scene based on the scene card and instructions.
Output ONLY the story prose.`,
		user: ({
			sceneTitle,
			purpose,
			setting,
			emotionalBeats,
			instructions,
		}: DraftScenePromptParams) =>
			`
Scene Title: ${sceneTitle || "Untitled"}
Purpose: ${purpose || "Not specified"}
Setting: ${setting || "Not specified"}
Emotional Beats: ${emotionalBeats || "None"}

Instructions: ${instructions || "Draft the scene."}
`,
	},

	generateIdeas: {
		system: () =>
			"You are a creative writing coach. Provide 3 distinct and interesting options for what could happen next in the story.",
		user: ({ context, currentText }: GenerateIdeasPromptParams) =>
			`Context:\n${context || "Not provided"}\n\nCurrent Text:\n${currentText || "None"}\n\nSuggest 3 plot developments:`,
	},

	rewriteSelection: {
		system: () =>
			"You are an expert editor. Rewrite the selected text according to the user's instruction. Output ONLY the rewritten text, no explanations.",
		user: ({ selection, instruction }: RewriteSelectionPromptParams) =>
			`Original Text:\n"${selection || ""}"\n\nInstruction: ${instruction || "Improve text"}\n\nRewritten Text:`,
	},

	coAuthorAlternatives: {
		system: () =>
			`You are an expert co-author helping a novelist iterate on prose.
Return three distinct alternatives that preserve the original meaning but vary pacing, texture, and voice.
Each alternative should be 1-3 sentences and avoid meta commentary.
For each alternative, provide:
- id: a short unique id (e.g., "alt-1")
- intent: the creative goal (e.g., "tighter pacing")
- tone: the tonal style (e.g., "cinematic")`,
		user: ({ selection, guidance }: CoAuthorAlternativesPromptParams) =>
			`Selected Text:\n"${selection || ""}"\n\nGuidance: ${
				guidance || "Vary pacing, sensory detail, and voice."
			}\n\nProvide three alternatives:`,
	},
};
