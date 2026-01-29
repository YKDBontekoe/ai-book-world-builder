"use client";

import { Download, History, Loader2, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/atoms/popover";
import { Separator } from "@/components/atoms/separator";
import { exportProject } from "@/features/writer/actions";
import { SessionInsights } from "@/features/writer/components/tools/session-insights";
import { SprintWidget } from "@/features/writer/components/tools/sprint-widget";
import { WritingGoals } from "@/features/writer/components/tools/writing-goals";
import { useWriterContent } from "@/features/writer/components/writer-content-context";
import { useWriterContext } from "@/features/writer/components/writer-context";

interface SnapshotButtonProps {
	onClick: () => void;
	isSnapshotting: boolean;
}

function SnapshotButton({ onClick, isSnapshotting }: SnapshotButtonProps) {
	return (
		<Button
			variant="ghost"
			size="sm"
			className="h-7 px-2 text-xs w-full justify-start"
			onClick={onClick}
			disabled={isSnapshotting}
		>
			{isSnapshotting ? (
				<Loader2 className="mr-2 h-3 w-3 animate-spin" />
			) : (
				<History className="mr-2 h-3 w-3" />
			)}
			Create Snapshot
		</Button>
	);
}

export function WriterToolsMenu(): React.ReactElement {
	const { handleSnapshot, isSnapshotting } = useWriterContent();
	const { project } = useWriterContext();
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		const toastId = toast.loading("Exporting project...");
		try {
			const result = await exportProject(project.id);
			if (result.success && result.content) {
				await navigator.clipboard.writeText(result.content);
				toast.success("Project exported to clipboard", { id: toastId });
			} else {
				toast.error(result.error || "Failed to export", { id: toastId });
			}
		} catch (_error) {
			toast.error("Error exporting project", { id: toastId });
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50"
					aria-label="Writer Tools"
				>
					<Sparkles className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-56 p-2">
				<div className="flex flex-col gap-1">
					<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
						Writing Aids
					</div>
					<div className="flex flex-col gap-1">
						<SprintWidget />
						<WritingGoals />
						<SessionInsights />
					</div>
					<Separator className="my-1" />
					<SnapshotButton
						onClick={handleSnapshot}
						isSnapshotting={isSnapshotting}
					/>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs w-full justify-start"
						onClick={handleExport}
						disabled={isExporting}
					>
						{isExporting ? (
							<Loader2 className="mr-2 h-3 w-3 animate-spin" />
						) : (
							<Download className="mr-2 h-3 w-3" />
						)}
						Export Project
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
