"use client";

import {
	CheckIcon,
	Loader2Icon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { executeEntityOperations } from "@/app/(chat)/entity-actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EntityOperation = {
	action: "create" | "update" | "delete";
	entityId?: string;
	payload?: any;
};

interface EntityProposalProps {
	projectId: string;
	operations: EntityOperation[];
}

export function EntityProposal({ projectId, operations }: EntityProposalProps) {
	const [status, setStatus] = useState<
		"pending" | "executing" | "completed" | "error"
	>("pending");
	const [resultMessage, setResultMessage] = useState<string | null>(null);
	const { mutate } = useSWRConfig();

	const handleConfirm = async () => {
		setStatus("executing");
		try {
			const result = await executeEntityOperations({ projectId, operations });
			setStatus("completed");
			setResultMessage("Changes applied successfully.");
			toast.success("Changes applied successfully.");

			// Refresh entity lists
			await mutate(["entities", projectId]);
			await mutate(["relationships", projectId]);
		} catch (error) {
			setStatus("error");
			setResultMessage("Failed to apply changes.");
			toast.error("Failed to apply changes.");
		}
	};

	const handleCancel = () => {
		// Just visually disable it or maybe feedback to AI?
		// for now, just show cancelled state
		setStatus("completed"); // effectively hides actions
		setResultMessage("Proposal cancelled.");
	};

	if (status === "completed" || status === "error") {
		return (
			<div className="rounded-lg border border-border/50 p-4 text-sm bg-muted/30 flex items-center gap-2">
				{status === "completed" && (
					<CheckIcon className="h-4 w-4 text-green-500" />
				)}
				{status === "error" && <XIcon className="h-4 w-4 text-red-500" />}
				<span className="text-muted-foreground">{resultMessage}</span>
			</div>
		);
	}

	return (
		<Card className="w-full max-w-md border-border/60 shadow-sm">
			<CardHeader className="pb-3 px-4 pt-4">
				<CardTitle className="text-base">Proposed Changes</CardTitle>
				<CardDescription className="text-xs">
					Review the following changes to your entities.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2 text-sm px-4 pb-2">
				{operations.map((op, idx) => (
					<div
						key={idx}
						className="group flex items-start gap-3 rounded-lg border border-border/40 p-3 bg-card hover:bg-muted/30 transition-colors"
					>
						<div className="mt-0.5 shrink-0">
							{op.action === "create" && (
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
									<PlusIcon className="h-3 w-3" />
								</div>
							)}
							{op.action === "update" && (
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
									<PencilIcon className="h-3 w-3" />
								</div>
							)}
							{op.action === "delete" && (
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
									<TrashIcon className="h-3 w-3" />
								</div>
							)}
						</div>
						<div className="flex-1 space-y-1 min-w-0">
							<div className="flex items-center justify-between">
								<span className="font-medium capitalize text-foreground/90">
									{op.action} Entity
								</span>
								{op.action === "delete" && op.entityId && (
									<span className="font-mono text-[10px] text-muted-foreground/50 truncate max-w-[60px]">
										{op.entityId}
									</span>
								)}
							</div>

							{op.payload?.name && (
								<div className="text-xs">
									<span className="text-muted-foreground">Name: </span>
									<span className="font-medium">{op.payload.name}</span>
								</div>
							)}
							{op.payload?.kind && (
								<div className="text-xs">
									<span className="text-muted-foreground">Kind: </span>
									<span className="font-medium">{op.payload.kind}</span>
								</div>
							)}

							{op.payload?.summary && (
								<div className="text-[11px] text-muted-foreground/80 line-clamp-2 italic pt-0.5">
									"{op.payload.summary}"
								</div>
							)}
							{op.payload?.attributes && op.payload.attributes.length > 0 && (
								<div className="text-[10px] text-muted-foreground pt-1">
									<span className="font-medium">{op.payload.attributes.length}</span> attribute(s) modified
								</div>
							)}
						</div>
					</div>
				))}
			</CardContent>
			<CardFooter className="flex justify-end gap-2 p-3 bg-muted/5 border-t border-border/30">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleCancel}
					disabled={status === "executing"}
					className="h-7 text-xs"
				>
					Cancel
				</Button>
				<Button
					size="sm"
					onClick={handleConfirm}
					disabled={status === "executing"}
					className="h-7 text-xs"
				>
					{status === "executing" && (
						<Loader2Icon className="mr-2 h-3 w-3 animate-spin" />
					)}
					Confirm Changes
				</Button>
			</CardFooter>
		</Card>
	);
}
