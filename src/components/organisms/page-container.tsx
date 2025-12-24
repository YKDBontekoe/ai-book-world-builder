import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
	children: ReactNode;
	centered?: boolean;
	className?: string;
};

export function PageContainer({
	children,
	centered = false,
	className,
}: PageContainerProps) {
	return (
		<div
			className={cn(
				"flex min-h-dvh flex-col gap-6 p-6",
				centered ? "items-center justify-center" : "",
				className,
			)}
		>
			{children}
		</div>
	);
}
