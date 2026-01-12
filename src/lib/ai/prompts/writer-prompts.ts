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

export interface RewriteScenePromptParams {
	sceneTitle: string;
	currentContent: string;
	instructions: string;
}

export interface ExpandScenePromptParams {
	sceneTitle: string;
	notes: string;
}

export interface CritiqueChapterPromptParams {
	fullText: string;
}

export interface AnalyzeConsistencyPromptParams {
	fullText: string;
	entityContext: string;
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

	rewriteScene: {
		system: () =>
			"You are an expert editor and fiction writer. Your task is to rewrite the scene based on the instructions provided. Maintain the voice and style unless told otherwise.",
		user: ({
			sceneTitle,
			currentContent,
			instructions,
		}: RewriteScenePromptParams) =>
			`
You are an expert editor and fiction writer.
Rewrite the following scene based on these instructions: "${instructions}"

Original Scene Title: ${sceneTitle}
Original Content:
${currentContent || "(No content yet)"}
`,
	},

	expandScene: {
		system: () =>
			"You are an expert fiction writer. Your task is to expand the provided skeletal notes into full, vivid prose. Focus on sensory details, dialogue, and pacing.",
		user: ({ sceneTitle, notes }: ExpandScenePromptParams) =>
			`
You are an expert fiction writer.
Expand the following rough notes/skeleton into a full, vivid scene.
Focus on sensory details, dialogue, and pacing.

Scene Title: ${sceneTitle}
Notes/Skeleton:
${notes || ""}
`,
	},

	critiqueChapter: {
		system: () =>
			"You are an expert literary critic and editor. Provide a detailed, constructive critique of the provided fiction chapter.",
		user: ({ fullText }: CritiqueChapterPromptParams) =>
			`
Analyze the following fiction chapter. Provide a critique on strengths, weaknesses, pacing, and tone.
Be constructive but honest.

Chapter Text:
${fullText}
`,
	},

	analyzeConsistency: {
		system: () =>
			"You are a continuity editor. Your task is to identify plot holes, character inconsistencies, and setting errors in the text.",
		user: ({ fullText, entityContext }: AnalyzeConsistencyPromptParams) =>
			`
Analyze the following chapter for consistency errors.
Check for:
1. Plot holes or contradictions.
2. Character inconsistencies (names, behavior, physical traits).
3. Setting errors.

Known Entities (Context):
${entityContext}

Chapter Text:
${fullText}
`,
	},
};
