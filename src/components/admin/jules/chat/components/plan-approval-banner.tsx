import { Check, Loader2, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import type { JSX } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import type { JulesActivity, JulesPlan } from "@/lib/jules-client";

interface PlanApprovalBannerProps {
	reviewData: {
		riskLevel: string;
		analysis: string;
		recommendations: string[];
	} | null;
	isReviewing: boolean;
	isApproving: boolean;
	isSendingFeedback: boolean;
	activities: JulesActivity[];
	onReview: (plan: JulesPlan) => void;
	onApprove: () => void;
	onRequestChanges: () => void;
	onReject: () => void;
}

export function PlanApprovalBanner({
	reviewData,
	isReviewing,
	isApproving,
	isSendingFeedback,
	activities,
	onReview,
	onApprove,
	onRequestChanges,
	onReject,
}: PlanApprovalBannerProps): JSX.Element {
	return (
		<div className="space-y-4">
			{reviewData && (
				<Alert
					variant={reviewData.riskLevel === "LOW" ? "default" : "destructive"}
					className="bg-background/80 backdrop-blur-md"
				>
					{reviewData.riskLevel === "LOW" ? (
						<ShieldCheck className="h-4 w-4 text-green-500" />
					) : (
						<ShieldAlert className="h-4 w-4" />
					)}
					<AlertTitle>
						AI Security Review: {reviewData.riskLevel} Risk
					</AlertTitle>
					<AlertDescription className="mt-2 text-xs">
						<p className="mb-2">{reviewData.analysis}</p>
						<ul className="list-disc list-inside">
							{reviewData.recommendations.map((rec, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: stable
								<li key={i}>{rec}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			<GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/20 flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="font-medium">Plan requires approval</span>
				</div>
				<div className="flex items-center gap-2">
					{!reviewData && activities.find((a) => a.planGenerated) && (
						<Button
							variant="secondary"
							size="sm"
							onClick={() => {
								const planActivity = activities.find((a) => a.planGenerated);
								if (planActivity?.planGenerated?.plan) {
									onReview(planActivity.planGenerated.plan);
								}
							}}
							disabled={isReviewing}
							className="gap-2"
						>
							{isReviewing ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Shield className="h-4 w-4" />
							)}
							AI Review
						</Button>
					)}
					<Button
						variant="outline"
						onClick={onRequestChanges}
						disabled={isSendingFeedback}
					>
						Request Changes
					</Button>
					<Button
						variant="outline"
						onClick={onReject}
						disabled={isSendingFeedback}
					>
						Reject Plan
					</Button>
					<Button
						onClick={onApprove}
						disabled={isApproving}
						className="gap-2"
						aria-label={isApproving ? "Approving plan" : "Approve plan"}
					>
						{isApproving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Check className="h-4 w-4" />
						)}
						{isApproving ? "Approving..." : "Approve Plan"}
					</Button>
				</div>
			</GlassCard>
		</div>
	);
}
