"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	Copy,
	Download,
	FileJson,
	FileText,
	Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { GlassCard } from "@/components/molecules/glass-card";

interface BulkActionsBarProps {
	selectedCount: number;
	isProcessing: boolean;
	onClear: () => void;
	onSelectAll: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onExportJson: () => void;
	onExportCsv: () => void;
}

/**
 * A floating bar that appears when items are selected, providing bulk actions
 * like delete, duplicate, and export.
 *
 * @param props - The component props
 * @returns The rendered floating action bar
 */
export function BulkActionsBar({
	selectedCount,
	isProcessing,
	onClear,
	onSelectAll,
	onDelete,
	onDuplicate,
	onExportJson,
	onExportCsv,
}: BulkActionsBarProps): React.JSX.Element {
	return (
		<AnimatePresence>
			{selectedCount > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
				>
					<GlassCard
						variant="liquid"
						className="flex items-center justify-between p-3 pl-5 pr-3 shadow-xl border-primary/20 backdrop-blur-xl"
					>
						<div className="flex items-center gap-4">
							<div className="text-sm font-medium">
								{selectedCount} selected
							</div>
							<div className="h-4 w-px bg-border" />
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-muted-foreground hover:text-foreground"
								onClick={onClear}
							>
								Deselect All
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-muted-foreground hover:text-foreground"
								onClick={onSelectAll}
							>
								Select All
							</Button>
						</div>
						<div className="flex items-center gap-2 border-r border-border pr-2 mr-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										size="sm"
										variant="ghost"
										className="gap-2 text-muted-foreground hover:text-foreground"
										disabled={isProcessing}
										aria-label="Export selected projects"
									>
										<Download className="h-4 w-4" />
										Export
										<ChevronDown className="h-3 w-3 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem onClick={onExportJson}>
										<FileJson className="mr-2 h-4 w-4" />
										<span>Export to JSON</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={onExportCsv}>
										<FileText className="mr-2 h-4 w-4" />
										<span>Export to CSV</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								size="sm"
								variant="ghost"
								className="gap-2 text-muted-foreground hover:text-foreground"
								onClick={onDuplicate}
								disabled={isProcessing}
							>
								<Copy className="h-4 w-4" />
								Duplicate
							</Button>
						</div>

						<Button
							size="sm"
							variant="destructive"
							className="gap-2 shadow-lg hover:shadow-destructive/20"
							onClick={onDelete}
							disabled={isProcessing}
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</Button>
					</GlassCard>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
