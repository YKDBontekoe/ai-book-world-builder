import { useEffect, useState } from "react";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/elements/tool";
import type { ToolInvocation } from "@/lib/types";

interface GenericToolProps {
	toolName: string;
	state: ToolInvocation["state"];
	input: any;
	output?: any;
	toolCallId: string;
}

export function GenericTool({
	toolName,
	state,
	input,
	output,
	toolCallId,
}: GenericToolProps) {
	const [isOpen, setIsOpen] = useState(state !== "result");

	// Auto-collapse when done, unless there is an error
	useEffect(() => {
		if (state === "result") {
			const hasError =
				output && typeof output === "object" && "error" in output;
			if (!hasError) {
				setIsOpen(false);
			}
		} else {
			setIsOpen(true);
		}
	}, [state, output]);

	// Map the tool invocation state to the UI state expected by ToolHeader
	// The 'ai' package uses 'partial-call' | 'call' | 'result'
	// our ToolHeader expects 'input-streaming' | 'input-available' | 'output-available' | 'output-error'

	let uiState:
		| "input-streaming"
		| "input-available"
		| "output-available"
		| "output-error" = "input-available";

	if (state === "partial-call") {
		uiState = "input-streaming";
	} else if (state === "call") {
		uiState = "input-available";
	} else if (state === "result") {
		if (output && typeof output === "object" && "error" in output) {
			uiState = "output-error";
		} else {
			uiState = "output-available";
		}
	}

	return (
		<Tool open={isOpen} onOpenChange={setIsOpen} key={toolCallId}>
			<ToolHeader state={uiState} type={toolName} />
			<ToolContent>
				{/* Always show input if available */}
				<ToolInput input={input} />

				{/* Show output if available */}
				{state === "result" && (
					<ToolOutput
						errorText={
							output && typeof output === "object" && "error" in output
								? String(output.error)
								: undefined
						}
						output={
							output && typeof output === "object" && !("error" in output) ? (
								<pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
									{JSON.stringify(output, null, 2)}
								</pre>
							) : null
						}
					/>
				)}
			</ToolContent>
		</Tool>
	);
}
