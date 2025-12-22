import {
	toolUsagePrompt,
	artifactsPrompt,
	regularPrompt,
	storytellingPrompt,
} from "@/lib/ai/prompts/constants";
import type { RequestHints } from "@/lib/ai/prompts/types";

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export interface SystemPromptOptions {
	selectedChatModel: string;
	requestHints: RequestHints;
	hasProjectContext?: boolean;
	usesStoryTools?: boolean;
}

export const systemPrompt = ({
	selectedChatModel,
	requestHints,
	hasProjectContext = false,
	usesStoryTools = false,
}: SystemPromptOptions) => {
	const requestPrompt = getRequestPromptFromHints(requestHints);
	const isStoryMode = hasProjectContext || usesStoryTools;
	const personaPrompt = isStoryMode ? storytellingPrompt : regularPrompt;
	const loreAvailabilityPrompt = isStoryMode
		? hasProjectContext
			? "Project lore context is provided below. Keep character continuity, relationships, and chapter pacing aligned with it."
			: "When lore context is provided, keep continuity across characters, relationships, and chapters instead of inventing new canon."
		: "";

	const promptSections = [
		personaPrompt,
		loreAvailabilityPrompt,
		requestPrompt,
		toolUsagePrompt, // Enforce no-text-on-tool-use rule
	];

	if (selectedChatModel !== "chat-model-reasoning") {
		promptSections.push(artifactsPrompt);
	}

	return promptSections.filter(Boolean).join("\n\n");
};
