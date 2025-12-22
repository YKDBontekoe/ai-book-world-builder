"use client";

import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/atoms/animated";

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
