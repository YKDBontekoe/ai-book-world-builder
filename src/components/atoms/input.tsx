import * as React from "react";
import { CrossSmallIcon } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, onClear, value, ...props }, ref) => {
		const hasValue = value !== undefined && value !== "" && value !== null;

		if (onClear) {
			return (
				<div className="relative w-full">
					<input
						type={type}
						className={cn(
							"flex h-10 w-full rounded-lg glass-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
							"pr-8", // Space for the clear button
							className,
						)}
						ref={ref}
						value={value}
						{...props}
					/>
					{hasValue && (
						<button
							type="button"
							onClick={onClear}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-0.5"
							aria-label="Clear input"
						>
							<CrossSmallIcon className="h-4 w-4" />
						</button>
					)}
				</div>
			);
		}

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
	},
);
Input.displayName = "Input";

export { Input };
