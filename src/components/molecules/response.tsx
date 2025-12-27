"use client";

import {
	type ComponentProps,
	memo,
	useCallback,
	useRef,
	useState,
} from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import {
	ParagraphActions,
	type ParagraphActionType,
} from "./paragraph-actions";

type ResponseProps = ComponentProps<typeof Streamdown> & {
	onAction?: (type: ParagraphActionType, text: string) => void;
};

export const Response = memo(
	({ className, onAction, ...props }: ResponseProps) => {
		const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
			null,
		);
		const containerRef = useRef<HTMLDivElement>(null);

		const handleMouseMove = useCallback(
			(e: React.MouseEvent) => {
				if (!onAction) return;

				const target = e.target as HTMLElement;
				// Check if we are hovering a paragraph tag directly
				if (target.tagName === "P") {
					if (target !== hoveredElement) {
						setHoveredElement(target);
					}
				} else {
					// Only clear if we've moved completely off the current element
					if (hoveredElement && !hoveredElement.contains(target)) {
						setHoveredElement(null);
					}
				}
			},
			[hoveredElement, onAction],
		);

		const handleMouseLeave = useCallback(() => {
			setHoveredElement(null);
		}, []);

		return (
			<div
				ref={containerRef}
				className="relative w-full group/response"
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			>
				<Streamdown
					className={cn(
						"size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
						// Add a class to paragraphs to make them easier to target/style
						"[&_p]:relative [&_p]:transition-colors [&_p]:duration-200 [&_p]:rounded-sm [&_p:hover]:bg-primary/5 [&_p]:cursor-text",
						className,
					)}
					{...props}
				/>
				{hoveredElement && onAction && (
					<ParagraphActions
						targetElement={hoveredElement}
						onAction={(type, text) => {
							onAction(type, text);
							setHoveredElement(null);
						}}
						onDismiss={() => setHoveredElement(null)}
					/>
				)}
			</div>
		);
	},
	(prevProps, nextProps) =>
		prevProps.children === nextProps.children &&
		prevProps.onAction === nextProps.onAction,
);

Response.displayName = "Response";
