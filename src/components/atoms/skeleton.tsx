"use client";

import { FadeIn } from "@/components/atoms/animated";
import { cn } from "@/lib/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<FadeIn duration={0.3}>
			<div
				className={cn("animate-pulse rounded-md bg-muted", className)}
				{...props}
			/>
		</FadeIn>
	);
}

export { Skeleton };
