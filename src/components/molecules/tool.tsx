"use client";

import type { ToolUIPart } from "ai";
import {
	CheckCircleIcon,
	ChevronDownIcon,
	CircleIcon,
	ClockIcon,
	WrenchIcon,
	XCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/atoms/collapsible";
import { cn } from "@/lib/utils";
import { KeyValueTable } from "@/components/molecules/key-value-table";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
	<Collapsible
		className={cn(
			"not-prose mb-4 w-full rounded-lg glass-panel overflow-hidden",
			className,
		)}
		{...props}
	/>
);

export type ToolHeaderProps = {
	type: string;
	state: ToolUIPart["state"];
	className?: string;
};

const getStatusBadge = (status: ToolUIPart["state"]) => {
	const labels = {
		"input-streaming": "Pending",
		"input-available": "Running",
		"output-available": "Completed",
		"output-error": "Error",
	} as const;

	const icons = {
		"input-streaming": <CircleIcon className="size-4" />,
		"input-available": <ClockIcon className="size-4 animate-pulse" />,
		"output-available": <CheckCircleIcon className="size-4 text-green-600" />,
		"output-error": <XCircleIcon className="size-4 text-red-600" />,
	} as const;

	return (
		<Badge
			className="flex items-center gap-1 rounded-full text-xs"
			variant="secondary"
		>
			{icons[status]}
			<span>{labels[status]}</span>
		</Badge>
	);
};

export const ToolHeader = ({
	className,
	type,
	state,
	...props
}: ToolHeaderProps) => (
	<CollapsibleTrigger
		className={cn(
			"flex w-full min-w-0 items-center justify-between gap-2 p-3 transition-colors hover:bg-muted/50",
			className,
		)}
		{...props}
	>
		<div className="flex min-w-0 flex-1 items-center gap-2">
			<div
				className={cn(
					"flex size-6 items-center justify-center rounded-md bg-primary/10",
					{
						"animate-pulse bg-blue-500/10 text-blue-500":
							state === "input-available" || state === "input-streaming",
						"bg-green-500/10 text-green-500": state === "output-available",
						"bg-red-500/10 text-red-500": state === "output-error",
					},
				)}
			>
				<WrenchIcon className="size-3.5" />
			</div>
			<span className="truncate font-medium text-sm">{type}</span>
		</div>
		<div className="flex shrink-0 items-center gap-2">
			{getStatusBadge(state)}
			<ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
		</div>
	</CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
	<CollapsibleContent
		className={cn(
			"data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in",
			className,
		)}
		{...props}
	/>
);

export type ToolInputProps = ComponentProps<"div"> & {
	input: ToolUIPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
	<div className={cn("space-y-2 overflow-hidden p-4", className)} {...props}>
		<div className="flex items-center justify-between">
			<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
				Parameters
			</h4>
		</div>
		<Collapsible>
			<CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
				<ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
				Show details
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-2">
				<KeyValueTable data={input} />
			</CollapsibleContent>
		</Collapsible>
	</div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
	output: ReactNode;
	errorText: ToolUIPart["errorText"];
};

export const ToolOutput = ({
	className,
	output,
	errorText,
	...props
}: ToolOutputProps) => {
	if (!(output || errorText)) {
		return null;
	}

	return (
		<div className={cn("space-y-2 p-4", className)} {...props}>
			<div className="flex items-center justify-between">
				<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
					{errorText ? "Error" : "Result"}
				</h4>
			</div>

			{errorText ? (
				<div className="bg-destructive/10 text-destructive overflow-x-auto rounded-md text-xs p-2">
					{errorText}
				</div>
			) : (
				<Collapsible>
					<CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
						<ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
						Show details
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-2">
						<KeyValueTable data={output} />
					</CollapsibleContent>
				</Collapsible>
			)}
		</div>
	);
};
