"use client";

import { motion } from "framer-motion";
import {
	Download,
	Filter,
	Maximize2,
	Minimize2,
	RefreshCw,
	Search,
	Sparkles,
} from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Switch } from "@/components/atoms/switch";
import { GlassCard } from "@/components/molecules/glass-card";
import { cn } from "@/lib/utils";

interface TaskBoardToolbarProps {
	activeTab: "board" | "chat";
	setActiveTab: (tab: "board" | "chat") => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	typeFilter: "all" | "issue" | "pr" | "session";
	setTypeFilter: (filter: "all" | "issue" | "pr" | "session") => void;
	isCompact: boolean;
	setIsCompact: (compact: boolean) => void;
	onRefresh: () => void;
	onExport: () => void;
	isRefreshing: boolean;
}

export function TaskBoardToolbar({
	activeTab,
	setActiveTab,
	searchQuery,
	setSearchQuery,
	typeFilter,
	setTypeFilter,
	isCompact,
	setIsCompact,
	onRefresh,
	onExport,
	isRefreshing,
}: TaskBoardToolbarProps): JSX.Element {
	return (
		<GlassCard
			size="sm"
			className="flex flex-col sm:flex-row gap-4 items-center justify-between p-2"
		>
			{/* View Switcher */}
			<div className="flex items-center bg-muted/50 p-1 rounded-lg">
				<Button
					variant={activeTab === "board" ? "secondary" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("board")}
					className="h-8 text-xs font-medium px-4 shadow-sm"
				>
					Task Board
				</Button>
				<Button
					variant={activeTab === "chat" ? "secondary" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("chat")}
					className="h-8 text-xs font-medium px-4 gap-2 shadow-sm"
				>
					<Sparkles className="w-3.5 h-3.5 text-primary" />
					Planner Chat
				</Button>
			</div>

			{activeTab === "board" && (
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
				>
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
						<Input
							placeholder="Filter tasks..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 h-9 bg-background/50 border-transparent focus:border-input focus:bg-background transition-all"
							aria-label="Filter tasks"
						/>
					</div>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<Select
								value={typeFilter}
								onValueChange={(v) =>
									setTypeFilter(v as "all" | "issue" | "pr" | "session")
								}
							>
								<SelectTrigger className="w-[120px] h-9 bg-background/50 border-transparent focus:border-input focus:bg-background">
									<div className="flex items-center gap-2">
										<Filter className="h-3.5 w-3.5 text-muted-foreground" />
										<SelectValue placeholder="Type" />
									</div>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="issue">Issues</SelectItem>
									<SelectItem value="pr">Pull Requests</SelectItem>
									<SelectItem value="session">Sessions</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="h-6 w-px bg-border/50" />

						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								onClick={onExport}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
								title="Export All to CSV (Cmd+E)"
							>
								<Download className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={onRefresh}
								disabled={isRefreshing}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
								title="Refresh Data"
							>
								<RefreshCw
									className={cn("h-4 w-4", isRefreshing && "animate-spin")}
								/>
							</Button>
						</div>

						<div className="h-6 w-px bg-border/50" />

						<div className="flex items-center gap-2">
							<Label
								htmlFor="compact-mode"
								className="text-xs text-muted-foreground cursor-pointer flex items-center gap-2 select-none hover:text-foreground transition-colors"
							>
								{isCompact ? (
									<Minimize2 className="h-4 w-4" />
								) : (
									<Maximize2 className="h-4 w-4" />
								)}
							</Label>
							<Switch
								id="compact-mode"
								checked={isCompact}
								onCheckedChange={setIsCompact}
								className="scale-75"
							/>
						</div>
					</div>
				</motion.div>
			)}
		</GlassCard>
	);
}
