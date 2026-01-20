"use client";

import { History, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/atoms/popover";
import { Separator } from "@/components/atoms/separator";
import { SessionInsights } from "@/features/writer/components/tools/session-insights";
import { SprintWidget } from "@/features/writer/components/tools/sprint-widget";
import { WritingGoals } from "@/features/writer/components/tools/writing-goals";
import { useWriterContent } from "@/features/writer/components/writer-content-context";

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

export function WriterToolsMenu() {
	const { handleSnapshot, isSnapshotting } = useWriterContent();

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
				</div>
			</PopoverContent>
		</Popover>
	);
}
