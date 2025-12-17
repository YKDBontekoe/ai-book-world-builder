import {
	ArrowDownIcon,
	ArrowUpIcon,
	BrainIcon,
	CheckCircleIcon,
	EyeIcon,
	ZapIcon,
} from "lucide-react";
import { SelectItem } from "../../ui/select";
import { cn } from "../../../lib/utils";
import { getProviderGradient, ProviderIcon } from "../provider-icon";
import { FavoriteToggle } from "./favorite-toggle";
import type { ChatModel } from "../../../lib/ai/models";

function getPricePerMillion(price: string | number): number {
	const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
	return parsedPrice < 0.01 ? parsedPrice * 1_000_000 : parsedPrice;
}

function formatPrice(value: string | number): string {
	const price = getPricePerMillion(value);
	return price < 0.01 ? price.toFixed(4) : price.toFixed(2);
}

interface ModelListItemProps {
	model: ChatModel;
	isSelected: boolean;
	isFavorite: boolean;
	canSort: boolean;
	isFirst: boolean;
	isLast: boolean;
	onMoveFavorite: (modelId: string, direction: "up" | "down") => void;
	onToggleFavorite: (modelId: string) => void;
	value: string;
	showProvider?: boolean;
}

export function ModelListItem({
	model,
	isSelected,
	isFavorite,
	canSort,
	isFirst,
	isLast,
	onMoveFavorite,
	onToggleFavorite,
	value,
	showProvider = true,
}: ModelListItemProps) {
	return (
		<SelectItem
			value={value}
			className={cn(
				"group relative rounded-lg p-2 transition-all duration-200",
				"hover:bg-gradient-to-r",
				`hover:${getProviderGradient(model.provider)}`,
				isSelected && "bg-primary/5 ring-1 ring-primary/20",
			)}
			data-testid={`model-card-${model.id}`}
		>
			<div className="flex items-start gap-2.5">
				{showProvider && (
					<ProviderIcon provider={model.provider} size="md" />
				)}
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<span className="truncate font-medium text-sm">
							{model.name}
						</span>
						<div className="flex items-center gap-1">
							{model.supportsImages && (
								<span
									className="flex h-4 w-4 items-center justify-center rounded bg-violet-500/10 text-violet-600 dark:text-violet-400"
									title="Vision capable"
								>
									<EyeIcon className="h-2.5 w-2.5" />
								</span>
							)}
							{model.reasoning && (
								<span
									className="flex h-4 w-4 items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
									title="Reasoning"
								>
									<BrainIcon className="h-2.5 w-2.5" />
								</span>
							)}
							{(model.id.toLowerCase().includes("flash") ||
								model.id.toLowerCase().includes("mini")) && (
								<span
									className="flex h-4 w-4 items-center justify-center rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
									title="Fast"
								>
									<ZapIcon className="h-2.5 w-2.5" />
								</span>
							)}
						</div>
					</div>
					<div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
						<span>{model.provider}</span>
						{model.pricing?.input && (
							<>
								<span>•</span>
								<span className="text-emerald-600 dark:text-emerald-400">
									{(() => {
										const input = formatPrice(model.pricing.input);
										const output = model.pricing.output
											? formatPrice(model.pricing.output)
											: null;
										return output ? `$${input}/$${output}` : `$${input}`;
									})()}
								</span>
							</>
						)}
					</div>
				</div>
				<div className="flex items-center gap-1">
					{canSort && (
						<div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
							<button
								type="button"
								aria-label={`Move ${model.name} up in favorites`}
								onPointerDown={(event) => {
									event.preventDefault();
									event.stopPropagation();
									onMoveFavorite(model.id, "up");
								}}
								className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
								disabled={isFirst}
							>
								<ArrowUpIcon className="h-3 w-3" />
							</button>
							<button
								type="button"
								aria-label={`Move ${model.name} down in favorites`}
								onPointerDown={(event) => {
									event.preventDefault();
									event.stopPropagation();
									onMoveFavorite(model.id, "down");
								}}
								className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
								disabled={isLast}
							>
								<ArrowDownIcon className="h-3 w-3" />
							</button>
						</div>
					)}
					<FavoriteToggle
						isFavorite={isFavorite}
						onToggle={(event) => {
							event.preventDefault();
							event.stopPropagation();
							onToggleFavorite(model.id);
						}}
						label={
							isFavorite
								? `Remove ${model.name} from favorites`
								: `Add ${model.name} to favorites`
						}
					/>
				</div>
			</div>
			<div className="absolute right-2 top-2 text-foreground opacity-0 group-data-[state=checked]/select-item:opacity-100 dark:text-foreground">
				<CheckCircleIcon size={16} />
			</div>
		</SelectItem>
	);
}
