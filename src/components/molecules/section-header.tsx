import type React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	title: React.ReactNode;
	description?: React.ReactNode;
	icon?: React.ElementType;
	iconClassName?: string;
	action?: React.ReactNode;
	metadata?: React.ReactNode;
}

export function SectionHeader({
	title,
	description,
	icon: Icon,
	iconClassName,
	action,
	metadata,
	className,
	...props
}: SectionHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
				className,
			)}
			{...props}
		>
			<div className="space-y-1.5">
				<div className="flex items-center gap-2">
					{Icon && (
						<Icon
							className={cn("h-5 w-5 text-muted-foreground", iconClassName)}
							aria-hidden="true"
						/>
					)}
					<h3 className="text-lg font-semibold tracking-tight">{title}</h3>
					{metadata && <div className="ml-2 flex items-center">{metadata}</div>}
				</div>
				{description && (
					<p className="text-sm text-muted-foreground max-w-2xl">
						{description}
					</p>
				)}
			</div>
			{action && <div className="mt-2 sm:mt-0">{action}</div>}
		</div>
	);
}
