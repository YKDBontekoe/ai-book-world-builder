/**
 * Determines the color class for the readiness bar based on the score.
 * @param score - The readiness score (0-100).
 * @returns Tailwind CSS background color class.
 */
export function getReadinessColor(score: number): string {
	if (score >= 70) return "bg-green-500";
	if (score >= 40) return "bg-amber-500";
	return "bg-red-400";
}

/**
 * Determines if the widget is in a loading state.
 * @param hasOutput - Whether the tool has produced output.
 * @param hasError - Whether the tool has encountered an error.
 * @param state - The current state string of the tool execution.
 * @returns True if the widget is loading, false otherwise.
 */
export function isWidgetLoading(
	hasOutput: boolean,
	hasError: boolean,
	state: string,
): boolean {
	return (
		!hasOutput &&
		!hasError &&
		(state === "call" ||
			state === "partial-call" ||
			state === "input-streaming" ||
			state === "input-available")
	);
}
