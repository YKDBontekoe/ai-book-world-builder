import { CheckCircle2, Loader2 } from "lucide-react";
import type { WidgetInput, WidgetOutput } from "@/components/organisms/chat/widgets/generation/types";

export function WriterContent({
	isLoading,
	input,
	output,
}: {
	isLoading: boolean;
	input: WidgetInput;
	output?: WidgetOutput;
}) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 p-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-3">
					<Loader2 className="h-4 w-4 animate-spin text-amber-500" />
					<span>Drafting scene content based on context...</span>
				</div>
				{input?.instructions && (
					<div className="ml-7 text-xs italic opacity-80">
						Instructions: "{input.instructions}"
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 p-4 text-sm">
			<div className="flex items-center gap-2 font-medium text-foreground">
				<CheckCircle2 className="h-4 w-4 text-green-500" />
				<span>Draft Complete</span>
			</div>
			{output?.preview && (
				<div className="relative rounded-md border bg-muted/20 p-3 italic text-muted-foreground">
					{output.preview}
				</div>
			)}
			<div className="flex gap-4 text-xs text-muted-foreground">
				{output?.wordCount && <span>Words: {output.wordCount}</span>}
				{output?.sceneId && <span>Scene ID: {output.sceneId}</span>}
			</div>
		</div>
	);
}
