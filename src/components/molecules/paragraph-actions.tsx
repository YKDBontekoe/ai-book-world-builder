"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Maximize2Icon,
	MessageCircleQuestionIcon,
	Minimize2Icon,
	RefreshCwIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export type ParagraphActionType = "rewrite" | "expand" | "shorten" | "ask";

interface ParagraphActionsProps {
	targetElement: HTMLElement | null;
	onAction: (type: ParagraphActionType, text: string) => void;
	onDismiss: () => void;
}

export function ParagraphActions({
	targetElement,
	onAction,
	onDismiss,
}: ParagraphActionsProps) {
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!targetElement) return;

		const updatePosition = () => {
			const rect = targetElement.getBoundingClientRect();
			setPosition({
				top: rect.top + window.scrollY,
				left: rect.right + 12 + window.scrollX, // Position to the right
			});
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition);
		};
	}, [targetElement]);

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				targetElement &&
				!targetElement.contains(event.target as Node)
			) {
				onDismiss();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onDismiss, targetElement]);

	if (!targetElement) return null;

	return createPortal(
		<AnimatePresence>
			<motion.div
				ref={menuRef}
				initial={{ opacity: 0, scale: 0.9, x: -10 }}
				animate={{ opacity: 1, scale: 1, x: 0 }}
				exit={{ opacity: 0, scale: 0.9, x: -10 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				className={cn(
					"fixed z-50 flex flex-col gap-1 p-1 rounded-lg border shadow-lg glass-panel backdrop-blur-md",
					"bg-background/80 border-primary/10",
				)}
				style={{
					top: position.top,
					left: position.left,
				}}
			>
				<ActionButton
					icon={<RefreshCwIcon className="size-3.5" />}
					label="Rewrite"
					onClick={() => onAction("rewrite", targetElement.innerText)}
				/>
				<ActionButton
					icon={<Maximize2Icon className="size-3.5" />}
					label="Expand"
					onClick={() => onAction("expand", targetElement.innerText)}
				/>
				<ActionButton
					icon={<Minimize2Icon className="size-3.5" />}
					label="Shorten"
					onClick={() => onAction("shorten", targetElement.innerText)}
				/>
				<div className="h-px w-full bg-border/50 my-0.5" />
				<ActionButton
					icon={<MessageCircleQuestionIcon className="size-3.5" />}
					label="Ask"
					onClick={() => onAction("ask", targetElement.innerText)}
				/>
			</motion.div>
		</AnimatePresence>,
		document.body,
	);
}

function ActionButton({
	icon,
	label,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={onClick}
			type="button"
			className="flex items-center justify-start gap-2 h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 w-full"
		>
			{icon}
			<span>{label}</span>
		</Button>
	);
}
