"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import type { AppUsage } from "@/lib/usage";

export function MessageUsage({ usage }: { usage?: AppUsage }) {
	if (!usage) return null;

	const { totalTokens, totalCost, promptTokens, completionTokens } = usage;

	if (!totalTokens && !totalCost) return null;

	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 select-none cursor-default hover:text-muted-foreground transition-colors mt-1">
						<span className="font-mono">
							{totalTokens?.toLocaleString()} tok
						</span>
						{totalCost !== undefined && (
							<>
								<span>·</span>
								<span className="font-mono">${totalCost.toFixed(5)}</span>
							</>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					<div className="grid gap-1 min-w-[120px]">
						<div className="font-semibold border-b pb-1 mb-1">
							Usage Details
						</div>
						<div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
							<span>Input:</span>
							<span className="font-mono">
								{promptTokens?.toLocaleString() ?? 0}
							</span>
							<span>Output:</span>
							<span className="font-mono">
								{completionTokens?.toLocaleString() ?? 0}
							</span>
							<div className="col-span-2 border-t my-1 opacity-50" />
							<span className="font-medium">Total:</span>
							<span className="font-mono font-medium">
								{totalTokens?.toLocaleString()}
							</span>
						</div>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
