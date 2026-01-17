"use client";

import type { ReactElement } from "react";
import { CheckCircle2, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export interface CoAuthorAlternative {
	id: string;
	intent: string;
	tone: string;
	text: string;
}

interface CoAuthorAlternativesPanelProps {
	alternatives: CoAuthorAlternative[];
	isLoading?: boolean;
	onApply: (alternativeId: string) => void;
	onDismiss: () => void;
	onRefresh?: () => void;
}

export function CoAuthorAlternativesPanel({
	alternatives,
	isLoading = false,
	onApply,
	onDismiss,
	onRefresh,
}: CoAuthorAlternativesPanelProps): ReactElement {
	return (
		<div className="flex flex-col gap-3 max-w-lg">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold uppercase text-muted-foreground">
						Co-Author Alternatives
					</span>
					{isLoading && (
						<span className="flex items-center gap-2 text-xs text-muted-foreground">
							<span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							Generating
						</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					{onRefresh && (
						<Button
							type="button"
							size="icon"
							variant="ghost"
							className="h-7 w-7"
							onClick={onRefresh}
							disabled={isLoading}
							aria-label="Refresh alternatives"
						>
							<RefreshCw className="h-3.5 w-3.5" />
						</Button>
					)}
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="h-7 w-7"
						onClick={onDismiss}
						aria-label="Close alternatives"
					>
						<X className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			<div className="space-y-3">
				{alternatives.map((alternative) => (
					<div
						key={alternative.id}
						className={cn(
							"rounded-lg border border-white/10 bg-background/40 p-3",
							"flex flex-col gap-2",
						)}
					>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="text-[10px] uppercase">
								{alternative.intent}
							</Badge>
							<Badge variant="secondary" className="text-[10px] uppercase">
								{alternative.tone}
							</Badge>
						</div>
						<p className="text-sm leading-relaxed text-foreground">
							{alternative.text}
						</p>
						<div className="flex justify-end">
							<Button
								type="button"
								size="sm"
								className="gap-2 rounded-lg"
								onClick={() => onApply(alternative.id)}
							>
								<CheckCircle2 className="h-3.5 w-3.5" />
								Use this version
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
