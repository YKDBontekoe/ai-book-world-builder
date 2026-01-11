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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { rewriteSelection } from "@/features/writer/actions/ai";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
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
	const [position, setPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [_isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [rewrittenText, setRewrittenText] = useState<string | null>(null);
	const [showMore, setShowMore] = useState(false);

	useEffect(() => {
		if (!editorView) return;

		const updateMenu = () => {
			const { state } = editorView;
			const { from, to, empty } = state.selection;

			if (empty || loading) {
				setPosition(null);
				setIsOpen(false);
				return;
			}

			const start = editorView.coordsAtPos(from);
			const _end = editorView.coordsAtPos(to);
			const box = editorView.dom.getBoundingClientRect();

			setPosition({
				top: start.top - box.top - 40, // Position above selection
				left: start.left - box.left,
			});
			setIsOpen(true);
		};

		editorView.dom.addEventListener("mouseup", updateMenu);
		editorView.dom.addEventListener("keyup", updateMenu);
		editorView.dom.addEventListener("scroll", updateMenu); // Handle scroll too

		return () => {
			editorView.dom.removeEventListener("mouseup", updateMenu);
			editorView.dom.removeEventListener("keyup", updateMenu);
			editorView.dom.removeEventListener("scroll", updateMenu);
		};
	}, [editorView, loading]);

	const handleRewrite = async (style: string) => {
		if (!editorView) return;
		setLoading(true);
		const { from, to } = editorView.state.selection;
		const text = editorView.state.doc.textBetween(from, to);

		const result = await rewriteSelection(
			text,
			`Rewrite this to be more ${style}`,
		);

		setLoading(false);
		if (result.text) {
			setRewrittenText(result.text);
		} else {
			toast.error("Rewrite failed");
		}
	};

	const applyRewrite = () => {
		if (!editorView || !rewrittenText) return;
		const { from, to } = editorView.state.selection;

		editorView.dispatch(
			editorView.state.tr.replaceWith(
				from,
				to,
				editorView.state.schema.text(rewrittenText),
			),
		);
		setRewrittenText(null);
		setIsOpen(false);
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
								onClick={applyRewrite}
								title="Apply"
							>
								<Check className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
								onClick={() => setRewrittenText(null)}
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
