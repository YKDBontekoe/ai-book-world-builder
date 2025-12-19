import {
	BookOpenIcon,
	BrainIcon,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Loader2,
	type LucideIcon,
	MapPinIcon,
	PenIcon,
	SparklesIcon,
	StethoscopeIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InteractiveWidget } from "./interactive-widget";

/**
 * Interface representing the input parameters for a widget.
 * Flexible structure to accommodate various tool inputs.
 */
interface WidgetInput {
	userRequest?: string;
	instructions?: string;
	[key: string]: unknown;
}

/**
 * Interface representing the decision output from the Orchestrator tool.
 */
interface OrchestratorDecision {
	actionIcon?: string;
	actionTitle?: string;
	nextAction?: string;
	targetName?: string;
	[key: string]: unknown;
}

/**
 * Interface representing project statistics.
 */
interface ProjectStats {
	characters?: number;
	locations?: number;
	chapters?: number;
	scenes?: number;
	draftedScenes?: number;
	[key: string]: unknown;
}

/**
 * Interface representing the output data from a widget tool.
 */
interface WidgetOutput {
	error?: string;
	decision?: OrchestratorDecision;
	projectStats?: ProjectStats;
	readinessScore?: number;
	projectName?: string;
	nextStepPreview?: string;
	preview?: string;
	wordCount?: number;
	sceneId?: string;
	message?: string;
	[key: string]: unknown;
}

/**
 * Props for the GenerationWidget component.
 */
interface GenerationWidgetProps {
	toolName: string;
	state: string;
	input: WidgetInput;
	output?: WidgetOutput;
}

/**
 * Helper component for displaying statistical badges with an icon, value, and label.
 */
function StatBadge({
	icon: Icon,
	value,
	label,
}: {
	icon: LucideIcon;
	value: number;
	label: string;
}) {
	return (
		<div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2 py-1 text-xs">
			<Icon className="h-3 w-3 text-muted-foreground" />
			<span className="font-medium">{value}</span>
			<span className="text-muted-foreground">{label}</span>
		</div>
	);
}

/**
 * Determines the color class for the readiness bar based on the score.
 * @param score - The readiness score (0-100).
 * @returns Tailwind CSS background color class.
 */
function getReadinessColor(score: number): string {
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
function isWidgetLoading(
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

/**
 * Component to display the content for the Orchestrator tool.
 */
function OrchestratorContent({
	isLoading,
	input,
	output,
	latestLogMessage,
}: {
	isLoading: boolean;
	input: WidgetInput;
	output?: WidgetOutput;
	latestLogMessage?: string;
}) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-3 p-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-3">
					<Loader2 className="h-4 w-4 animate-spin text-purple-500" />
					<div className="flex flex-col">
						<span className="text-foreground font-medium">
							{latestLogMessage || "Analyzing your project..."}
						</span>
						<span className="text-xs opacity-80">The Brain is thinking...</span>
					</div>
				</div>
				{input?.userRequest && (
					<div className="rounded-md bg-muted/30 p-2 text-xs italic">
						"{input.userRequest}"
					</div>
				)}
			</div>
		);
	}

	const decision = output?.decision;
	const stats = output?.projectStats;
	const readiness = output?.readinessScore ?? 0;
	const projectName = output?.projectName;

	return (
		<div className="flex flex-col gap-3 p-4 text-sm">
			{/* Project Name */}
			{projectName && (
				<div className="font-medium text-foreground text-xs uppercase tracking-wide opacity-60">
					{projectName}
				</div>
			)}

			{/* Readiness Score Bar */}
			<div className="space-y-1.5">
				<div className="flex items-center justify-between text-xs">
					<span className="text-muted-foreground">Project Readiness</span>
					<span
						className={cn(
							"font-semibold",
							readiness >= 70
								? "text-green-600"
								: readiness >= 40
									? "text-amber-600"
									: "text-red-500",
						)}
					>
						{readiness}%
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
					<div
						className={cn(
							"h-full transition-all duration-500",
							getReadinessColor(readiness),
						)}
						style={{ width: `${Math.min(readiness, 100)}%` }}
					/>
				</div>
			</div>

			{/* Project Stats */}
			{stats && (
				<div className="flex flex-wrap gap-1.5">
					{(stats.characters ?? 0) > 0 && (
						<StatBadge
							icon={UsersIcon}
							value={stats.characters ?? 0}
							label="chars"
						/>
					)}
					{(stats.locations ?? 0) > 0 && (
						<StatBadge
							icon={MapPinIcon}
							value={stats.locations ?? 0}
							label="places"
						/>
					)}
					{(stats.chapters ?? 0) > 0 && (
						<StatBadge
							icon={BookOpenIcon}
							value={stats.chapters ?? 0}
							label="chaps"
						/>
					)}
					{(stats.scenes ?? 0) > 0 && (
						<span className="flex items-center gap-1 text-xs text-muted-foreground">
							({stats.draftedScenes ?? 0}/{stats.scenes} scenes drafted)
						</span>
					)}
				</div>
			)}

			{/* Divider */}
			<div className="border-t border-border/50" />

			{/* Next Action */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<span className="text-lg">{decision?.actionIcon || "🎯"}</span>
					<div>
						<div className="font-semibold text-foreground">
							{decision?.actionTitle || decision?.nextAction || "Analyzing..."}
						</div>
						{decision?.targetName && (
							<div className="text-xs text-muted-foreground">
								Target: {decision.targetName}
							</div>
						)}
					</div>
				</div>

				{/* Action Description */}
				{output?.nextStepPreview && (
					<div className="rounded-md bg-muted/30 p-2.5 text-xs text-muted-foreground leading-relaxed">
						{output.nextStepPreview}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Component to display the content for the Writer (Draft Scene) tool.
 */
function WriterContent({
	isLoading,
	input,
	output,
}: {
	isLoading: boolean;
	input: WidgetInput;
	output?: WidgetOutput;
}) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 p-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-3">
					<Loader2 className="h-4 w-4 animate-spin text-amber-500" />
					<span>Drafting scene content based on context...</span>
				</div>
				{input?.instructions && (
					<div className="ml-7 text-xs italic opacity-80">
						Instructions: "{input.instructions}"
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 p-4 text-sm">
			<div className="flex items-center gap-2 font-medium text-foreground">
				<CheckCircle2 className="h-4 w-4 text-green-500" />
				<span>Draft Complete</span>
			</div>
			{output?.preview && (
				<div className="relative rounded-md border bg-muted/20 p-3 italic text-muted-foreground">
					{output.preview}
				</div>
			)}
			<div className="flex gap-4 text-xs text-muted-foreground">
				{output?.wordCount && <span>Words: {output.wordCount}</span>}
				{output?.sceneId && <span>Scene ID: {output.sceneId}</span>}
			</div>
		</div>
	);
}

/**
 * Component to display the content for Diagnostics and Assessment tools.
 */
function DiagnosticsContent({
	isLoading,
	output,
}: {
	isLoading: boolean;
	output?: WidgetOutput;
}) {
	if (isLoading) {
		return (
			<div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
				<span>Analyzing project health...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 p-4 text-sm">
			<div className="flex items-center gap-2 font-medium text-foreground">
				<CheckCircle2 className="h-4 w-4 text-green-500" />
				<span>Analysis Complete</span>
			</div>
			<div className="text-muted-foreground">
				{output?.message || "Diagnostics report updated."}
			</div>
		</div>
	);
}

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
