"use client";

import { motion } from "framer-motion";
import {
	Check,
	FileText,
	MoreHorizontal,
	Palette,
	Sparkles,
	TrendingUp,
	X,
	Zap,
} from "lucide-react";
import type { EditorView } from "prosemirror-view";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import { useAiRewrite } from "@/features/writer/hooks/use-ai-rewrite";
import { useBubbleMenuPosition } from "@/features/writer/hooks/use-bubble-menu-position";
import { cn } from "@/lib/utils";

interface EditorBubbleMenuProps {
	editorView: EditorView | null;
}

const REWRITE_STYLES = [
	{
		id: "descriptive",
		label: "More Descriptive",
		icon: FileText,
		color: "text-blue-400",
	},
	{ id: "concise", label: "More Concise", icon: Zap, color: "text-green-400" },
	{
		id: "dramatic",
		label: "More Dramatic",
		icon: TrendingUp,
		color: "text-purple-400",
	},
	{
		id: "formal",
		label: "More Formal",
		icon: FileText,
		color: "text-gray-400",
	},
	{
		id: "casual",
		label: "More Casual",
		icon: Sparkles,
		color: "text-orange-400",
	},
	{ id: "poetic", label: "More Poetic", icon: Palette, color: "text-pink-400" },
] as const;

export function EditorBubbleMenu({ editorView }: EditorBubbleMenuProps) {
	const {
		position,
		setIsOpen: setMenuOpen,
		setPosition,
	} = useBubbleMenuPosition(editorView);
	const { loading, rewrittenText, handleRewrite, applyRewrite, cancelRewrite } =
		useAiRewrite(editorView);
	const [showMore, setShowMore] = useState(false);

	const handleApply = () => {
		applyRewrite(() => {
			setMenuOpen(false);
			setPosition(null);
		});
	};

	if (!position || !editorView) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 10, scale: 0.95 }}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			className="absolute z-50"
			style={{ top: position.top, left: position.left }}
		>
			<GlassCard
				variant="liquid"
				className="p-2 shadow-2xl border-primary/20 backdrop-blur-xl"
			>
				{rewrittenText ? (
					<div className="flex items-center gap-2 max-w-md">
						<div className="flex-1 p-2 rounded-lg bg-background/50 border border-primary/10">
							<p className="text-xs text-muted-foreground mb-1">Preview:</p>
							<p className="text-sm leading-relaxed">{rewrittenText}</p>
						</div>
						<div className="flex flex-col gap-1">
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 hover:bg-green-500/20 hover:text-green-500"
								onClick={handleApply}
								title="Apply"
							>
								<Check className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
								onClick={cancelRewrite}
								title="Cancel"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-1 flex-wrap">
							{REWRITE_STYLES.slice(0, showMore ? undefined : 3).map(
								(style) => {
									const Icon = style.icon;
									return (
										<Button
											key={style.id}
											variant="ghost"
											size="sm"
											className={cn(
												"h-8 px-3 text-xs gap-1.5 transition-all",
												"hover:scale-105 active:scale-95",
												style.color,
											)}
											onClick={() => handleRewrite(style.id)}
											disabled={loading}
										>
											<Icon className="h-3.5 w-3.5" />
											{style.label}
										</Button>
									);
								},
							)}
							<Button
								variant="ghost"
								size="sm"
								className="h-8 px-2 text-xs"
								onClick={() => setShowMore(!showMore)}
							>
								<MoreHorizontal className="h-3.5 w-3.5" />
							</Button>
						</div>
						{loading && (
							<div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
								<div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
								<span>Rewriting...</span>
							</div>
						)}
					</div>
				)}
			</GlassCard>
		</motion.div>
	);
}
