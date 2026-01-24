"use client";

import { motion } from "framer-motion";
import { AlertCircle, Bot, GitPullRequest } from "lucide-react";
import type { JSX } from "react";
import type { GitHubIssue, GitHubPR } from "@/app/actions/github";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import type { JulesSession } from "@/lib/jules-client";
import { cn } from "@/lib/utils";

export type TaskItem =
	| { type: "issue"; data: GitHubIssue }
	| { type: "pr"; data: GitHubPR }
	| { type: "session"; data: JulesSession };

interface TaskCardProps {
	item: TaskItem;
	onSelect: (item: TaskItem) => void;
	onFix?: (issue: GitHubIssue) => void;
	compact?: boolean;
}

const MotionGlassCard = motion.create(GlassCard);

export function TaskCard({
	item,
	onSelect,
	onFix,
	compact,
}: TaskCardProps): JSX.Element {
	const renderContent = () => {
		switch (item.type) {
			case "issue":
				return (
					<>
						<div className="flex items-start justify-between gap-2">
							<div className="flex items-center gap-2 text-orange-600 dark:text-orange-500">
								<AlertCircle className="h-4 w-4" />
								<span className="text-xs font-mono font-medium opacity-80">
									#{item.data.number}
								</span>
							</div>
							<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded-full">
								Issue
							</span>
						</div>
						<h4
							className={cn(
								"font-medium text-sm mt-2 leading-relaxed text-foreground/90",
								compact ? "line-clamp-1" : "line-clamp-2",
							)}
						>
							{item.data.title}
						</h4>
						{!compact && (
							<div className="flex items-center justify-between mt-3">
								<div className="flex items-center gap-2">
									{item.data.user?.avatar_url && (
										// biome-ignore lint/performance/noImgElement: External asset
										<img
											src={item.data.user.avatar_url}
											alt={item.data.user.login}
											className="w-5 h-5 rounded-full ring-1 ring-background/50"
										/>
									)}
									<span className="text-xs text-muted-foreground/80 font-medium">
										{item.data.user?.login}
									</span>
								</div>
								{onFix && (
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											onFix(item.data);
										}}
										className="h-6 px-2.5 text-[10px] bg-primary/5 hover:bg-primary/10 text-primary/80 hover:text-primary gap-1.5 rounded-full transition-colors"
									>
										<Bot className="h-3 w-3" />
										Fix
									</Button>
								)}
							</div>
						)}
					</>
				);

			case "session":
				return (
					<>
						<div className="flex items-start justify-between gap-2">
							<div className="flex items-center gap-2 text-violet-600 dark:text-violet-500">
								<Bot className="h-4 w-4" />
								<span className="text-xs font-mono font-medium opacity-80 truncate max-w-[80px]">
									{item.data.id.split("/").pop()}
								</span>
							</div>
							<span className="text-[10px] uppercase tracking-wider font-semibold text-violet-600/70 bg-violet-500/10 px-1.5 py-0.5 rounded-full">
								{item.data.state.replace("STATE_", "").replace("_", " ")}
							</span>
						</div>
						<h4
							className={cn(
								"font-medium text-sm mt-2 leading-relaxed text-foreground/90",
								compact ? "line-clamp-1" : "line-clamp-2",
							)}
						>
							{item.data.title || item.data.prompt}
						</h4>
						{!compact && (
							<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
								</span>
								Active Session
							</div>
						)}
					</>
				);

			case "pr":
				return (
					<>
						<div className="flex items-start justify-between gap-2">
							<div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
								<GitPullRequest className="h-4 w-4" />
								<span className="text-xs font-mono font-medium opacity-80">
									#{item.data.number}
								</span>
							</div>
							<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded-full">
								PR
							</span>
						</div>
						<h4
							className={cn(
								"font-medium text-sm mt-2 leading-relaxed text-foreground/90",
								compact ? "line-clamp-1" : "line-clamp-2",
							)}
						>
							{item.data.title}
						</h4>
						{!compact && (
							<div className="flex items-center justify-between mt-3">
								<div className="flex items-center gap-2">
									{item.data.user?.avatar_url && (
										// biome-ignore lint/performance/noImgElement: External asset
										<img
											src={item.data.user.avatar_url}
											alt={item.data.user.login}
											className="w-5 h-5 rounded-full ring-1 ring-background/50"
										/>
									)}
									<span className="text-xs text-muted-foreground/80 font-medium">
										{item.data.user?.login}
									</span>
								</div>
								<div className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
									{item.data.base.ref} ← {item.data.head.ref}
								</div>
							</div>
						)}
					</>
				);
		}
	};

	return (
		<MotionGlassCard
			layout
			initial={{ opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.2 }}
			variant="liquid"
			className={cn(
				"cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-primary/5",
				compact ? "p-3" : "p-4",
			)}
			onClick={() => onSelect(item)}
		>
			{renderContent()}
		</MotionGlassCard>
	);
}
