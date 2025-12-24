"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import type { ArtifactKind } from "@/components/organisms/artifact";
import type { Suggestion } from "@/lib/db/schema";

interface PreviewSuggestionProps {
	suggestion: Suggestion;
	onApply: () => void;
	onReject?: () => void; // Optional, might be needed
	artifactKind: ArtifactKind;
}

export function PreviewSuggestion({
	suggestion,
	onApply,
	onReject,
	artifactKind: _artifactKind,
}: PreviewSuggestionProps) {
	return (
		<div className="absolute z-50 min-w-[300px] max-w-[500px] rounded-md border bg-popover p-3 shadow-lg animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 slide-in-from-bottom-2">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between border-b pb-2">
					<span className="text-sm font-medium text-popover-foreground">
						Suggested Change
					</span>
					<div className="flex items-center gap-1">
						{/* Add dismiss button if needed */}
					</div>
				</div>

				<div className="text-sm text-muted-foreground">
					{suggestion.description && (
						<p className="mb-2 italic">{suggestion.description}</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-2 text-xs">
					<div className="rounded bg-muted/50 p-2">
						<div className="mb-1 font-semibold text-red-500">Original</div>
						<div className="line-through opacity-70">
							{suggestion.originalText}
						</div>
					</div>
					<div className="rounded bg-muted/50 p-2">
						<div className="mb-1 font-semibold text-green-500">New</div>
						<div>{suggestion.suggestedText}</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2 pt-2">
					{onReject && (
						<Button
							size="sm"
							variant="ghost"
							onClick={onReject}
							className="h-8 w-8 p-0"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Reject</span>
						</Button>
					)}
					<Button
						size="sm"
						onClick={onApply}
						className="h-8 gap-2 bg-green-600 hover:bg-green-700"
					>
						<Check className="h-4 w-4" />
						Apply
					</Button>
				</div>
			</div>
		</div>
	);
}
