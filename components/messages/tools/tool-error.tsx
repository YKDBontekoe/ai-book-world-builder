import React from "react";

interface ToolErrorProps {
	error: string | unknown;
	toolCallId: string;
	prefix?: string;
}

export const ToolError: React.FC<ToolErrorProps> = ({
	error,
	toolCallId,
	prefix,
}) => {
	const errorMessage = typeof error === "string" ? error : String(error);
	const displayMessage = prefix ? `${prefix}: ${errorMessage}` : errorMessage;

	return (
		<div
			className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 text-sm dark:border-red-900 dark:bg-red-950/50"
			key={toolCallId}
		>
			{displayMessage}
		</div>
	);
};
