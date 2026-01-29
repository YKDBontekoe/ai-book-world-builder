"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/molecules/glass-card";
import { cn } from "@/lib/utils";

export interface SuggestionItem {
	id: string;
	label: string;
	value: string;
	icon?: LucideIcon;
	description?: string;
}

interface PowerDockSuggestionsProps {
	items: SuggestionItem[];
	selectedIndex: number;
	onSelect: (item: SuggestionItem) => void;
}

export function PowerDockSuggestions({
	items,
	selectedIndex,
	onSelect,
}: PowerDockSuggestionsProps) {
	if (items.length === 0) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 10, scale: 0.95 }}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			className="absolute bottom-full left-0 mb-2 w-full min-w-[300px] z-50"
		>
			<GlassCard
				variant="liquid"
				size="none"
				className="overflow-hidden rounded-xl border border-white/20 shadow-2xl backdrop-blur-xl"
			>
				<div className="flex flex-col p-1 max-h-[300px] overflow-y-auto">
					{items.map((item, index) => {
						const isSelected = index === selectedIndex;
						const Icon = item.icon;

						return (
							<button
								key={item.id}
								type="button"
								onClick={() => onSelect(item)}
								className={cn(
									"flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors",
									isSelected
										? "bg-primary/20 text-foreground"
										: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
								)}
							>
								{Icon && (
									<div
										className={cn(
											"flex items-center justify-center w-6 h-6 rounded-md bg-black/10 dark:bg-white/10",
											isSelected && "bg-primary/20 text-primary",
										)}
									>
										<Icon className="w-3.5 h-3.5" />
									</div>
								)}
								<div className="flex flex-col min-w-0">
									<span
										className={cn(
											"font-medium truncate",
											isSelected && "text-primary",
										)}
									>
										{item.label}
									</span>
									{item.description && (
										<span className="text-[10px] text-muted-foreground truncate opacity-80">
											{item.description}
										</span>
									)}
								</div>
								{isSelected && (
									<div className="ml-auto text-[10px] font-mono opacity-50">
										↵
									</div>
								)}
							</button>
						);
					})}
				</div>
			</GlassCard>
		</motion.div>
	);
}
