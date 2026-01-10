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

export interface ExpandScenePromptParams {
	sceneTitle: string;
	notes: string;
}

export interface RewriteScenePromptParams {
	sceneTitle: string;
	originalContent: string;
	instructions: string;
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

	expandScene: {
		system: () =>
			`You are an expert fiction writer. Your goal is to expand rough notes or a skeleton into a full, vivid scene. Focus on sensory details, dialogue, and pacing. Output ONLY the story prose.`,
		user: ({ sceneTitle, notes }: ExpandScenePromptParams) =>
			`Scene Title: ${sceneTitle}
Notes/Skeleton:
${notes || ""}`,
	},

	rewriteScene: {
		system: () =>
			`You are an expert editor and fiction writer. Rewrite the scene based on the instructions. Output ONLY the rewritten scene content.`,
		user: ({
			sceneTitle,
			originalContent,
			instructions,
		}: RewriteScenePromptParams) =>
			`Instructions: "${instructions}"

Original Scene Title: ${sceneTitle}
Original Content:
${originalContent || "(No content yet)"}`,
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
};
