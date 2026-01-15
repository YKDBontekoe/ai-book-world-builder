"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "@/components/molecules/glass-card";
import type { Entity } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { MentionState } from "./hooks/use-mention";

interface MentionListProps {
	mentionState: MentionState | null;
	mentionCoords: { left: number; top: number } | null;
	filteredEntities: Entity[];
	insertMention: (entity: Entity) => void;
}

export function MentionList({
	mentionState,
	mentionCoords,
	filteredEntities,
	insertMention,
}: MentionListProps) {
	return (
		<AnimatePresence>
			{mentionState?.active && mentionCoords && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="fixed z-50 w-64"
					style={{
						left: mentionCoords.left,
						top: mentionCoords.top,
					}}
				>
					<GlassCard
						variant="liquid"
						className="p-2 flex flex-col gap-1 max-h-64 overflow-y-auto shadow-2xl border-primary/20"
					>
						{filteredEntities.length === 0 ? (
							<div className="px-3 py-2 text-xs text-muted-foreground">
								No entities found
							</div>
						) : (
							filteredEntities.map((entity, i) => (
								<button
									type="button"
									key={entity.id}
									className={cn(
										"flex items-start gap-3 px-3 py-2.5 text-sm rounded-lg transition-all text-left group",
										"hover:bg-primary/10 hover:scale-[1.02]",
										i === mentionState.index
											? "bg-primary/20 text-primary shadow-sm border border-primary/30"
											: "hover:bg-muted/50",
									)}
									onClick={() => insertMention(entity)}
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-[10px] uppercase tracking-wider opacity-60 font-bold px-1.5 py-0.5 rounded bg-background/50">
												{entity.kind}
											</span>
											<span className="truncate font-semibold text-foreground">
												{entity.name}
											</span>
										</div>
										{entity.summary && (
											<p className="text-xs text-muted-foreground line-clamp-2 mt-1">
												{entity.summary}
											</p>
										)}
									</div>
								</button>
							))
						)}
					</GlassCard>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
