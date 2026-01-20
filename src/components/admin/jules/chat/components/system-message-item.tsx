import { format } from "date-fns";
import type { JSX } from "react";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";

export type SystemMessage = {
	id: string;
	createdAt: string;
	variant: "info" | "error";
	message: string;
	actionLabel?: string;
	onAction?: () => void;
};

export function SystemMessageItem({
	item,
}: {
	item: SystemMessage;
}): JSX.Element {
	return (
		<div className="flex flex-col items-center gap-2">
			<GlassCard
				className={`px-4 py-2 text-xs ${
					item.variant === "error"
						? "bg-red-500/10 border-red-500/20 text-red-600"
						: "bg-blue-500/10 border-blue-500/20 text-blue-700"
				}`}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<span>{item.message}</span>
					{item.actionLabel && item.onAction && (
						<Button size="sm" variant="outline" onClick={item.onAction}>
							{item.actionLabel}
						</Button>
					)}
				</div>
			</GlassCard>
			<span className="text-[10px] text-muted-foreground">
				System • {format(new Date(item.createdAt), "HH:mm")}
			</span>
		</div>
	);
}
