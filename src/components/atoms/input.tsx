import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
	onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, onClear, value, ...props }, ref) => {
		// Only wrap if onClear is provided to avoid regressions in other parts of the app
		if (!onClear) {
			return (
				<input
					type={type}
					className={cn(
						"flex h-10 w-full rounded-lg glass-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
						className,
					)}
					ref={ref}
					value={value}
					{...props}
				/>
			);
		}

		const showClearButton = value && String(value).length > 0;

		return (
			<div className="relative w-full">
				<input
					type={type}
					className={cn(
						"flex h-10 w-full rounded-lg glass-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
						showClearButton && "pr-10",
						className,
					)}
					ref={ref}
					value={value}
					{...props}
				/>
				{showClearButton && (
					<button
						type="button"
						onClick={onClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
						aria-label="Clear input"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input };
