import { BrainIcon, CoinsIcon, EyeIcon, ZapIcon } from "lucide-react";
import type { JSX } from "react";
import { ProviderIcon } from "@/components/organisms/chat/provider-icon";
import { isModelFree } from "@/lib/ai/model-utils";
import type { ChatModel } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

function getPricePerMillion(price: string | number): number {
	const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
	if (Number.isNaN(parsedPrice)) return 0;
	return parsedPrice * 1_000_000;
}

function formatPrice(value: string | number): string {
	const price = getPricePerMillion(value);
	// Small prices might still need precision
	return price < 0.01 ? price.toFixed(4) : price.toFixed(2);
}

interface ModelDetailsProps {
	model?: ChatModel;
	className?: string;
}

export function ModelDetails({
	model,
	className,
}: ModelDetailsProps): JSX.Element | null {
	if (!model) return null;

	const isFree = isModelFree(model);

	return (
		<div
			className={cn(
				"mt-3 rounded-lg border bg-muted/30 p-3 text-sm animate-in fade-in slide-in-from-top-1",
				className,
			)}
		>
			<div className="flex flex-col gap-3">
				{/* Header with Provider and Name */}
				<div className="flex items-center gap-2">
					<ProviderIcon provider={model.provider} size="sm" />
					<div className="flex flex-col">
						<span className="font-medium leading-none">{model.name}</span>
						<span className="text-[10px] text-muted-foreground mt-1">
							{model.id}
						</span>
					</div>
				</div>

				{/* Badges / Capabilities */}
				<div className="flex flex-wrap gap-2">
					{model.supportsImages === true && (
						<div className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-600 dark:text-violet-400 border border-violet-500/20">
							<EyeIcon className="h-3 w-3" />
							<span>Vision</span>
						</div>
					)}
					{model.reasoning && (
						<div className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400 border border-blue-500/20">
							<BrainIcon className="h-3 w-3" />
							<span>Reasoning</span>
						</div>
					)}
					{(model.id.toLowerCase().includes("flash") ||
						model.id.toLowerCase().includes("mini")) && (
						<div className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
							<ZapIcon className="h-3 w-3" />
							<span>Fast</span>
						</div>
					)}
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-2 border-t pt-2 mt-1">
					<div className="flex flex-col gap-0.5">
						<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
							Context
						</span>
						<span className="font-mono text-xs">
							{model.contextLength
								? `${Math.round(model.contextLength / 1000)}k tokens`
								: "Unknown"}
						</span>
					</div>
					<div className="flex flex-col gap-0.5">
						<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
							<CoinsIcon className="h-3 w-3" /> Pricing (1M)
						</span>
						<span className="font-mono text-xs">
							{isFree ? (
								<span className="text-emerald-600 dark:text-emerald-400 font-medium">
									Free
								</span>
							) : (
								<>
									${formatPrice(model.pricing?.input || 0)} / $
									{formatPrice(model.pricing?.output || 0)}
								</>
							)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
