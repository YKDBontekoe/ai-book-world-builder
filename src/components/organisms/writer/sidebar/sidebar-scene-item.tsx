"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SortableItem } from "@/components/molecules/sortable-list";
import { InlineEditableTitle } from "@/components/organisms/writer/inline-editable-title";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { cn } from "@/lib/utils";

interface SidebarSceneItemProps {
	scene: { id: string; title: string };
	isReadOnly: boolean;
	onUpdateTitle: (id: string, newTitle: string) => Promise<boolean>;
	onDelete: (id: string) => void;
}

export function SidebarSceneItem({
	scene,
	isReadOnly,
	onUpdateTitle,
	onDelete,
}: SidebarSceneItemProps) {
	const { activeSceneId, setActiveSceneId } = useWriterContext();

	return (
		<SortableItem
			key={scene.id}
			id={scene.id}
			disabled={isReadOnly}
			className={cn(
				"group/scene relative flex items-center gap-1 rounded-lg transition-all duration-200",
				activeSceneId === scene.id
					? "bg-white/50 dark:bg-white/5 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
					: "hover:bg-sidebar-accent/40",
			)}
		>
			{/* Active Indicator */}
			{activeSceneId === scene.id && (
				<motion.div
					layoutId="activeSceneIndicator"
					className="absolute left-1 width-1 h-[60%] w-0.5 bg-primary rounded-full"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2 }}
				/>
			)}

			{/* biome-ignore lint: using div to prevent nested button hydration error */}
			<div
				role="button"
				tabIndex={0}
				onClick={() => setActiveSceneId(scene.id)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setActiveSceneId(scene.id);
					}
				}}
				className={cn(
					"flex-1 flex items-center gap-3 pl-4 pr-2 py-2 text-sm cursor-pointer outline-none select-none w-full text-left",
					activeSceneId === scene.id
						? "text-primary dark:text-primary-foreground font-medium"
						: "text-muted-foreground/80 group-hover/scene:text-foreground",
				)}
			>
				<div
					className={cn(
						"h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300",
						activeSceneId === scene.id
							? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
							: "bg-border group-hover/scene:bg-muted-foreground/50",
					)}
				/>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: preventing parent activation */}
				<div
					className="flex-1 min-w-0"
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.stopPropagation();
						}
					}}
				>
					<InlineEditableTitle
						value={scene.title}
						onSave={(newTitle) => onUpdateTitle(scene.id, newTitle)}
						disabled={isReadOnly}
					/>
				</div>
			</div>
			{!isReadOnly && (
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 mr-1 text-muted-foreground/40 opacity-0 group-hover/scene:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all rounded-md"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(scene.id);
					}}
					aria-label="Delete scene"
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			)}
		</SortableItem>
	);
}
