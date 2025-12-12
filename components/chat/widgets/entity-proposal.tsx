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
			<div className="rounded-lg border p-4 text-sm bg-muted/50">
				{status === "completed" && (
					<CheckIcon className="inline mr-2 h-4 w-4 text-green-500" />
				)}
				{status === "error" && (
					<XIcon className="inline mr-2 h-4 w-4 text-red-500" />
				)}
				{resultMessage}
			</div>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Proposed Changes</CardTitle>
				<CardDescription>
					Review the following changes to your entities.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2 text-sm">
				{operations.map((op, idx) => (
					<div
						key={idx}
						className="flex items-start gap-2 rounded-md border p-2 bg-background"
					>
						<div className="mt-0.5">
							{op.action === "create" && (
								<PlusIcon className="h-4 w-4 text-green-500" />
							)}
							{op.action === "update" && (
								<PencilIcon className="h-4 w-4 text-amber-500" />
							)}
							{op.action === "delete" && (
								<TrashIcon className="h-4 w-4 text-red-500" />
							)}
						</div>
						<div className="flex-1 space-y-1">
							<div className="font-medium capitalize">{op.action} Entity</div>
							{op.payload?.name && (
								<div>
									Name:{" "}
									<span className="text-muted-foreground">
										{op.payload.name}
									</span>
								</div>
							)}
							{op.payload?.kind && (
								<div>
									Kind:{" "}
									<span className="text-muted-foreground">
										{op.payload.kind}
									</span>
								</div>
							)}
							{op.action === "delete" && op.entityId && (
								<div>
									ID: <span className="font-mono text-xs">{op.entityId}</span>
								</div>
							)}
							{op.payload?.summary && (
								<div className="text-xs text-muted-foreground line-clamp-2">
									{op.payload.summary}
								</div>
							)}
							{op.payload?.attributes && op.payload.attributes.length > 0 && (
								<div className="text-xs text-muted-foreground">
									{op.payload.attributes.length} attribute(s)
								</div>
							)}
						</div>
					</div>
				))}
			</CardContent>
			<CardFooter className="flex justify-end gap-2 pt-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleCancel}
					disabled={status === "executing"}
				>
					Cancel
				</Button>
				<Button
					size="sm"
					onClick={handleConfirm}
					disabled={status === "executing"}
				>
					{status === "executing" && (
						<Loader2Icon className="mr-2 h-3.5 w-3.5 animate-spin" />
					)}
					Confirm
				</Button>
			</CardFooter>
		</Card>
	);
}
