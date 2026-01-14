import { Slot } from "@radix-ui/react-slot";
import type React from "react";
import { memo } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { cn } from "@/lib/utils";

export interface ControlButtonProps {
	label: string;
	icon: React.ElementType;
	onClick?: () => void;
	active?: boolean;
	disabled?: boolean;
	shortcut?: string;
	className?: string;
	"data-testid"?: string;
	asChild?: boolean;
	children?: React.ReactNode;
}

export const ControlButton = memo(function ControlButton({
	label,
	icon: Icon,
	onClick,
	active,
	disabled,
	shortcut,
	className,
	"data-testid": testId,
	asChild,
	children,
}: ControlButtonProps): JSX.Element {
	const sharedClassName = cn(
		"relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
		"hover:bg-white/10 hover:scale-105 active:scale-95",
		active &&
			"bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]",
		disabled &&
			"opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
		!active && !disabled && "text-muted-foreground hover:text-foreground",
		className,
	);

	const indicator = active && (
		<div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
	);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				{asChild ? (
					<Slot
						className={sharedClassName}
						onClick={onClick}
						data-testid={testId}
						aria-label={label}
						// @ts-expect-error - Slot doesn't strictly type checked forwarded props but they work
						disabled={disabled}
					>
						{children}
					</Slot>
				) : (
					<button
						type="button"
						aria-label={label}
						onClick={onClick}
						disabled={disabled}
						data-testid={testId}
						className={sharedClassName}
					>
						<Icon className="w-5 h-5" />
						{indicator}
					</button>
				)}
			</TooltipTrigger>
			<TooltipContent side="top" className="flex items-center gap-2">
				<span>{label}</span>
				{shortcut && (
					<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-muted-foreground">
						{shortcut}
					</kbd>
				)}
			</TooltipContent>
		</Tooltip>
	);
});

export function ControlGroup({
	children,
}: { children: React.ReactNode }): JSX.Element {
	return <div className="flex items-center gap-1">{children}</div>;
}
