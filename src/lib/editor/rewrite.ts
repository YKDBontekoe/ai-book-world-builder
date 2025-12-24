export type RewriteIntent = "rewrite" | "shorten" | "expand";

export function buildRewritePrompt({
	selection,
	intent,
}: {
	selection: string;
	intent: RewriteIntent;
}): string {
	const trimmedSelection = selection.trim();
	const baseInstruction =
		"You are refining a highlighted section of a larger document. Work only on the provided selection and keep the surrounding context intact.";

	if (!trimmedSelection) {
		return baseInstruction;
	}

	const intentInstruction = {
		rewrite:
			"Rewrite the selection to be clearer while preserving the author's intent.",
		shorten:
			"Condense the selection to be more concise without losing critical details.",
		expand:
			"Expand the selection with richer detail and smoother transitions without changing the core meaning.",
	}[intent];

	return `${baseInstruction}\n\n${intentInstruction}\n\nSelected text:\n"""${trimmedSelection}"""`;
}
