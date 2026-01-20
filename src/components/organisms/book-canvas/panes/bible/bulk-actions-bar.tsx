"use client";

import { Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";

interface BulkActionsBarProps {
	selectedCount: number;
	onDelete: () => void;
	onExport: () => void;
	onClearSelection: () => void;
}

export function BulkActionsBar({
	selectedCount,
	onDelete,
	onExport,
	onClearSelection,
}: BulkActionsBarProps) {
	if (selectedCount === 0) return null;

	return (
		<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
			<GlassCard className="flex items-center gap-1 p-1.5 rounded-full shadow-lg border-primary/20 bg-background/80 backdrop-blur-md">
				<div className="pl-3 pr-2 text-xs font-medium text-foreground">
					{selectedCount} selected
				</div>
				<div className="h-4 w-px bg-border mx-1" />
				<Button
					size="sm"
					variant="ghost"
					onClick={onExport}
					className="h-7 px-3 rounded-full text-xs hover:bg-muted"
				>
					<Download className="mr-1.5 h-3.5 w-3.5" />
					Export
				</Button>
				<Button
					size="sm"
					variant="ghost"
					onClick={onDelete}
					className="h-7 px-3 rounded-full text-xs hover:bg-destructive/10 hover:text-destructive text-destructive"
				>
					<Trash2 className="mr-1.5 h-3.5 w-3.5" />
					Delete
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={onClearSelection}
					className="h-7 w-7 rounded-full ml-1 hover:bg-muted"
				>
					<X className="h-3.5 w-3.5" />
				</Button>
			</GlassCard>
		</div>
	);
}
