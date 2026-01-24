"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutList } from "lucide-react";
import type { JSX } from "react";
import type { GitHubIssue } from "@/app/actions/github";
import { CreateFeatureDialog } from "../create-feature-dialog";
import type { Column } from "../task-board-utils";
import { TaskCard, type TaskItem } from "../task-card";

interface TaskBoardColumnProps {
	column: Column;
	isCompact: boolean;
	defaultSource?: string;
	onSelect: (item: TaskItem) => void;
	onFix: (issue: GitHubIssue) => void;
}

export function TaskBoardColumn({
	column,
	isCompact,
	defaultSource,
	onSelect,
	onFix,
}: TaskBoardColumnProps): JSX.Element {
	return (
		<div className="w-[300px] flex-shrink-0 flex flex-col">
			<div className="flex items-center justify-between mb-4 px-1">
				<h3 className="font-semibold text-sm flex items-center gap-2 text-foreground/80">
					{column.title}
					<span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-mono">
						{column.items.length}
					</span>
				</h3>
				{column.id === "backlog" && defaultSource && (
					<CreateFeatureDialog defaultSource={defaultSource} />
				)}
			</div>

			<div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-10">
				<AnimatePresence mode="popLayout">
					{column.items.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed border-muted-foreground/10 rounded-xl bg-muted/5 p-6 text-center"
						>
							<div className="p-3 bg-muted/20 rounded-full mb-3">
								<LayoutList className="h-6 w-6 opacity-50" />
							</div>
							<p className="text-xs font-medium">No items in {column.title}</p>
						</motion.div>
					) : (
						column.items.map((item) => (
							<TaskCard
								key={item.type === "session" ? item.data.id : item.data.number}
								item={item}
								onSelect={onSelect}
								onFix={item.type === "issue" ? onFix : undefined}
								compact={isCompact}
							/>
						))
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
