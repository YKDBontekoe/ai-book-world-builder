import {
	BrainIcon,
	ChevronDown,
	ChevronUp,
	PenIcon,
	SparklesIcon,
	StethoscopeIcon,
	TrendingUpIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { useDataStream } from "@/components/organisms/chat/data-stream-provider";
import { DiagnosticsContent } from "@/components/organisms/chat/widgets/generation/diagnostics-content";
import { OrchestratorContent } from "@/components/organisms/chat/widgets/generation/orchestrator-content";
import type { GenerationWidgetProps } from "@/components/organisms/chat/widgets/generation/types";
import { isWidgetLoading } from "@/components/organisms/chat/widgets/generation/utils";
import { WriterContent } from "@/components/organisms/chat/widgets/generation/writer-content";
import { InteractiveWidget } from "@/components/organisms/chat/widgets/interactive-widget";

/**
 * Main GenerationWidget component that renders different content based on the active tool.
 * Handles loading states, error states, and collapsing behavior.
 */
export function GenerationWidget({
	toolName,
	state,
	input,
	output,
}: GenerationWidgetProps) {
	const { dataStream } = useDataStream();

	// Identify the type of tool being used
	const isOrchestratorTool = toolName === "orchestrateBook";
	const isDraftingTool = toolName === "draftScene";
	const isDiagnosticsTool = toolName === "runDiagnostics";
	const isAssessmentTool = toolName === "assessReadiness";

	// Determine output availability and error status
	const hasOutput = output && Object.keys(output).length > 0;
	const hasError = output && "error" in output;

	const isLoading = isWidgetLoading(!!hasOutput, !!hasError, state);

	const [isCollapsed, setIsCollapsed] = useState(false);

	// Retrieve the latest log message for this tool from the data stream
	const latestLog = dataStream
		?.filter(
			(item) =>
				(item as any).type === "tool-log" && (item as any).tool === toolName,
		)
		.slice(-1)[0] as unknown as { message: string } | undefined;

	// Effect to auto-collapse the widget when processing is complete
	useEffect(() => {
		if (!isLoading && state === "result" && !hasError) {
			const timer = setTimeout(() => setIsCollapsed(true), 1500);
			return () => clearTimeout(timer);
		}
		if (isLoading) {
			setIsCollapsed(false);
		}
	}, [isLoading, state, hasError]);

	// Render error state if an error occurred
	if (hasError) {
		return (
			<InteractiveWidget
				headerIcon={<div className="text-red-500">⚠️</div>}
				headerTitle="Error"
				headerColor="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
				isError
			>
				<div className="p-4 text-sm text-red-600 dark:text-red-400">
					{output?.error}
				</div>
			</InteractiveWidget>
		);
	}

	// Default header configuration
	let headerIcon = <SparklesIcon size={18} />;
	let headerTitle = "AI Task";
	let headerColor = "bg-primary/10 text-primary";
	let content = null;

	// Delegate rendering based on tool type
	if (isOrchestratorTool) {
		headerIcon = <BrainIcon size={18} />;
		headerTitle = "Orchestrator";
		headerColor =
			"bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
		content = (
			<OrchestratorContent
				isLoading={isLoading}
				input={input}
				output={output}
				latestLogMessage={latestLog?.message}
			/>
		);
	} else if (isDraftingTool) {
		headerIcon = <PenIcon size={18} />;
		headerTitle = "Writer";
		headerColor =
			"bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
		content = (
			<WriterContent isLoading={isLoading} input={input} output={output} />
		);
	} else if (isDiagnosticsTool || isAssessmentTool) {
		headerIcon = isDiagnosticsTool ? (
			<StethoscopeIcon size={18} />
		) : (
			<TrendingUpIcon size={18} />
		);
		headerTitle = isDiagnosticsTool ? "Diagnostics" : "Readiness Assessment";
		headerColor =
			"bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
		content = <DiagnosticsContent isLoading={isLoading} output={output} />;
	} else {
		// Fallback content for unknown tools
		content = (
			<div className="rounded border p-2 text-xs">
				{toolName}: {state}
			</div>
		);
	}

	return (
		<InteractiveWidget
			headerIcon={headerIcon}
			headerTitle={headerTitle}
			headerColor={headerColor}
			headerEnd={
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					{isCollapsed ? (
						<ChevronDown className="h-4 w-4" />
					) : (
						<ChevronUp className="h-4 w-4" />
					)}
				</Button>
			}
		>
			{!isCollapsed && content}
		</InteractiveWidget>
	);
}
