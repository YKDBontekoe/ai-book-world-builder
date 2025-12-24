import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
	submitOnCtrlEnter?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, submitOnCtrlEnter, onKeyDown, ...props }, ref) => {
		const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (submitOnCtrlEnter && (e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				e.currentTarget.form?.requestSubmit();
			}
			onKeyDown?.(e);
		};

		return (
			<textarea
				className={cn(
					"flex min-h-[80px] w-full rounded-lg glass-input px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
					className,
				)}
				ref={ref}
				onKeyDown={handleKeyDown}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
