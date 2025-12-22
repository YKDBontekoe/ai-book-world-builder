import {
	BookOpenIcon,
	Loader2,
	MapPinIcon,
	UsersIcon,
	type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetInput, WidgetOutput } from "@/components/organisms/chat/widgets/generation/types";
import { getReadinessColor } from "@/components/organisms/chat/widgets/generation/utils";

function StatBadge({
	icon: Icon,
	value,
	label,
}: {
	icon: LucideIcon;
	value: number;
	label: string;
}) {
	return (
		<div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2 py-1 text-xs">
			<Icon className="h-3 w-3 text-muted-foreground" />
			<span className="font-medium">{value}</span>
			<span className="text-muted-foreground">{label}</span>
		</div>
	);
}

export function OrchestratorContent({
	isLoading,
	input,
	output,
	latestLogMessage,
}: {
	isLoading: boolean;
	input: WidgetInput;
	output?: WidgetOutput;
	latestLogMessage?: string;
}) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-3 p-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-3">
					<Loader2 className="h-4 w-4 animate-spin text-purple-500" />
					<div className="flex flex-col">
						<span className="text-foreground font-medium">
							{latestLogMessage || "Analyzing your project..."}
						</span>
						<span className="text-xs opacity-80">The Brain is thinking...</span>
					</div>
				</div>
				{input?.userRequest && (
					<div className="rounded-md bg-muted/30 p-2 text-xs italic">
						"{input.userRequest}"
					</div>
				)}
			</div>
		);
	}

	const decision = output?.decision;
	const stats = output?.projectStats;
	const readiness = output?.readinessScore ?? 0;
	const projectName = output?.projectName;

	return (
		<div className="flex flex-col gap-3 p-4 text-sm">
			{/* Project Name */}
			{projectName && (
				<div className="font-medium text-foreground text-xs uppercase tracking-wide opacity-60">
					{projectName}
				</div>
			)}

			{/* Readiness Score Bar */}
			<div className="space-y-1.5">
				<div className="flex items-center justify-between text-xs">
					<span className="text-muted-foreground">Project Readiness</span>
					<span
						className={cn(
							"font-semibold",
							readiness >= 70
								? "text-green-600"
								: readiness >= 40
									? "text-amber-600"
									: "text-red-500",
						)}
					>
						{readiness}%
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
					<div
						className={cn(
							"h-full transition-all duration-500",
							getReadinessColor(readiness),
						)}
						style={{ width: `${Math.min(readiness, 100)}%` }}
					/>
				</div>
			</div>

			{/* Project Stats */}
			{stats && (
				<div className="flex flex-wrap gap-1.5">
					{(stats.characters ?? 0) > 0 && (
						<StatBadge
							icon={UsersIcon}
							value={stats.characters ?? 0}
							label="chars"
						/>
					)}
					{(stats.locations ?? 0) > 0 && (
						<StatBadge
							icon={MapPinIcon}
							value={stats.locations ?? 0}
							label="places"
						/>
					)}
					{(stats.chapters ?? 0) > 0 && (
						<StatBadge
							icon={BookOpenIcon}
							value={stats.chapters ?? 0}
							label="chaps"
						/>
					)}
					{(stats.scenes ?? 0) > 0 && (
						<span className="flex items-center gap-1 text-xs text-muted-foreground">
							({stats.draftedScenes ?? 0}/{stats.scenes} scenes drafted)
						</span>
					)}
				</div>
			)}

			{/* Divider */}
			<div className="border-t border-border/50" />

			{/* Next Action */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<span className="text-lg">{decision?.actionIcon || "🎯"}</span>
					<div>
						<div className="font-semibold text-foreground">
							{decision?.actionTitle || decision?.nextAction || "Analyzing..."}
						</div>
						{decision?.targetName && (
							<div className="text-xs text-muted-foreground">
								Target: {decision.targetName}
							</div>
						)}
					</div>
				</div>

				{/* Action Description */}
				{output?.nextStepPreview && (
					<div className="rounded-md bg-muted/30 p-2.5 text-xs text-muted-foreground leading-relaxed">
						{output.nextStepPreview}
					</div>
				)}
			</div>
		</div>
	);
}
