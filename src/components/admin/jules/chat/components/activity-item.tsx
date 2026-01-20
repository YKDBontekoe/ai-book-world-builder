import { format } from "date-fns";
import { Check } from "lucide-react";
import type { JSX } from "react";
import type { JulesActivity } from "@/lib/jules-client";
import { ArtifactRenderer } from "../../artifact-renderer";

/**
 * Renders a single activity item (message, plan, progress, etc.)
 */
export function ActivityItem({
	activity,
}: {
	activity: JulesActivity;
}): JSX.Element {
	const isUser = activity.userMessaged !== undefined;

	if (isUser) {
		return (
			<div className="flex flex-col gap-1 items-end">
				<div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
					{activity.userMessaged?.userMessage}
				</div>
				<span className="text-[10px] text-muted-foreground">
					{format(new Date(activity.createTime), "HH:mm")}
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 items-start">
			<div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] space-y-2">
				{/* Agent Message */}
				{activity.agentMessaged && (
					<div className="whitespace-pre-wrap">
						{activity.agentMessaged.agentMessage}
					</div>
				)}

				{/* Plan Generated */}
				{activity.planGenerated && (
					<div className="text-sm font-mono bg-background/50 p-2 rounded border">
						<div className="font-semibold mb-1 text-xs uppercase text-muted-foreground">
							Plan Generated
						</div>
						<ul className="list-disc list-inside space-y-1">
							{activity.planGenerated.plan.steps.map((step, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: stable enough
								<li key={i} className="text-xs">
									<span
										className={
											step.state === "COMPLETED"
												? "text-green-500"
												: step.state === "IN_PROGRESS"
													? "text-blue-500"
													: ""
										}
									>
										{step.state === "COMPLETED" ? "✅ " : "○ "}
									</span>
									{step.description}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Progress Update */}
				{activity.progressUpdated && (
					<div className="text-xs italic text-muted-foreground">
						<span className="font-semibold">
							{activity.progressUpdated.title}:
						</span>{" "}
						{activity.progressUpdated.description}
					</div>
				)}

				{/* Plan Approved */}
				{activity.planApproved && (
					<div className="text-xs font-medium text-green-600 flex items-center gap-1">
						<Check className="h-3 w-3" /> Plan Approved
					</div>
				)}

				{/* Error */}
				{activity.sessionFailed && (
					<div className="text-sm text-red-500 font-medium">
						❌ Session Failed: {activity.sessionFailed.reason}
					</div>
				)}

				{/* Completed */}
				{activity.sessionCompleted && (
					<div className="text-sm text-green-600 font-medium">
						🎉 Session Completed
					</div>
				)}

				{/* Artifacts */}
				{activity.artifacts && activity.artifacts.length > 0 && (
					<ArtifactRenderer artifacts={activity.artifacts} />
				)}
			</div>
			<span className="text-[10px] text-muted-foreground">
				Jules • {format(new Date(activity.createTime), "HH:mm")}
			</span>
		</div>
	);
}
