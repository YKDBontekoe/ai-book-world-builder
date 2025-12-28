import { cn } from "@/lib/utils";

interface KeyValueTableProps {
	data: unknown;
	className?: string;
	maxHeight?: number;
}

function formatKey(key: string): string {
	// Convert camelCase or snake_case to Title Case
	return key
		.replace(/([A-Z])/g, " $1")
		.replace(/_/g, " ")
		.replace(/^\w/, (c) => c.toUpperCase())
		.trim();
}

function formatValue(value: unknown): string {
	if (value === null || value === undefined) return "—";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "number") return value.toLocaleString();
	return String(value);
}

export function KeyValueTable({
	data,
	className,
	maxHeight = 250,
}: KeyValueTableProps) {
	if (!data || typeof data !== "object") {
		return (
			<div className="text-muted-foreground text-xs py-1">
				{data === null || data === undefined ? "—" : String(data)}
			</div>
		);
	}

	// Handle arrays
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return (
				<div className="text-muted-foreground text-xs italic">Empty list</div>
			);
		}
		return (
			<div className="flex flex-col gap-1">
				{data.map((item, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: "Index is stable here"
						key={index}
						className="flex items-start gap-2 text-xs"
					>
						<span className="text-muted-foreground shrink-0">{index + 1}.</span>
						{typeof item === "object" ? (
							<KeyValueTable data={item} maxHeight={150} />
						) : (
							<span className="font-mono">{formatValue(item)}</span>
						)}
					</div>
				))}
			</div>
		);
	}

	const entries = Object.entries(data as Record<string, unknown>);

	if (entries.length === 0) {
		return <div className="text-muted-foreground text-xs italic">No data</div>;
	}

	return (
		<div
			className={cn(
				"w-full rounded-lg border border-border/50 bg-muted/10 overflow-hidden",
				className,
			)}
		>
			<div className="overflow-auto" style={{ maxHeight: `${maxHeight}px` }}>
				<div className="divide-y divide-border/30">
					{entries.map(([key, value]) => (
						<div
							key={key}
							className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-3 py-2 hover:bg-muted/30 transition-colors"
						>
							<div className="shrink-0 sm:w-1/3 min-w-[100px]">
								<span className="text-xs font-medium text-muted-foreground">
									{formatKey(key)}
								</span>
							</div>
							<div className="flex-1 min-w-0">
								{typeof value === "object" && value !== null ? (
									<KeyValueTable data={value} maxHeight={150} />
								) : (
									<div className="text-sm font-mono break-all">
										{formatValue(value)}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
