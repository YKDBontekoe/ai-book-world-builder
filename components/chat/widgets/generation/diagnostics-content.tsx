import { CheckCircle2, Loader2 } from "lucide-react";
import type { WidgetOutput } from "./types";

export function DiagnosticsContent({
	isLoading,
	output,
}: {
	isLoading: boolean;
	output?: WidgetOutput;
}) {
	if (isLoading) {
		return (
			<div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
				<span>Analyzing project health...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 p-4 text-sm">
			<div className="flex items-center gap-2 font-medium text-foreground">
				<CheckCircle2 className="h-4 w-4 text-green-500" />
				<span>Analysis Complete</span>
			</div>
			<div className="text-muted-foreground">
				{output?.message || "Diagnostics report updated."}
			</div>
		</div>
	);
}
