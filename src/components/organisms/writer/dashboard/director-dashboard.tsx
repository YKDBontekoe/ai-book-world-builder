"use client";

import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	BookOpen,
	Clock,
	Users,
	X,
	Zap,
} from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	Cell,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { GlassCard } from "@/components/molecules/glass-card";
import type { NarrativeMetrics } from "@/hooks/use-narrative-intelligence";

interface DirectorDashboardProps {
	metrics: NarrativeMetrics;
	isVisible: boolean;
	onClose: () => void;
}

export function DirectorDashboard({
	metrics,
	isVisible,
	onClose,
}: DirectorDashboardProps) {
	if (!isVisible) return null;

	const {
		wordCount,
		readingTimeMinutes,
		pacingScore,
		pacingGraphData,
		characterMentions,
		complexityScore,
	} = metrics;

	// Sort characters by mentions
	const topCharacters = Object.entries(characterMentions)
		.sort(([, a], [, b]) => b - a)
		.map(([name, count]) => ({ name, count }));

	const pacingColor =
		pacingScore > 70
			? "hsl(var(--destructive))" // Fast/Action
			: pacingScore < 30
				? "hsl(var(--primary))" // Slow/Descriptive
				: "hsl(var(--chart-2))"; // Balanced

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className="absolute top-16 right-4 bottom-4 w-96 z-40 pointer-events-auto"
		>
			<GlassCard
				variant="liquid"
				className="h-full flex flex-col overflow-hidden border-primary/20 shadow-2xl backdrop-blur-3xl"
			>
				{/* Header */}
				<div className="p-4 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Activity className="h-4 w-4 text-primary" />
						<span className="font-semibold text-sm tracking-wide">
							DIRECTOR MODE
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="text-[10px] h-5 bg-background/50"
						>
							LIVE ANALYSIS
						</Badge>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={onClose}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-4 space-y-6">
						{/* Key Stats Grid */}
						<div className="grid grid-cols-2 gap-3">
							<StatBox
								label="Word Count"
								value={wordCount.toLocaleString()}
								icon={BookOpen}
							/>
							<StatBox
								label="Read Time"
								value={`~${readingTimeMinutes} min`}
								icon={Clock}
							/>
							<StatBox
								label="Pacing"
								value={Math.round(pacingScore).toString()}
								subValue={
									pacingScore > 70
										? "Fast"
										: pacingScore < 30
											? "Slow"
											: "Balanced"
								}
								icon={Zap}
								color={pacingColor}
							/>
							<StatBox
								label="Complexity"
								value={Math.round(complexityScore).toString()}
								icon={BarChart3}
							/>
						</div>

						{/* Pacing Chart */}
						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
								<span>Pacing Arc</span>
								<span className="text-[10px] opacity-70">
									(Sentence Length Inv.)
								</span>
							</div>
							<div className="h-32 w-full bg-background/20 rounded-lg p-2 border border-primary/5">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={pacingGraphData}>
										<defs>
											<linearGradient
												id="pacingGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor={pacingColor}
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor={pacingColor}
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<RechartsTooltip
											contentStyle={{
												backgroundColor: "hsl(var(--popover))",
												borderColor: "hsl(var(--border))",
												borderRadius: "8px",
												fontSize: "12px",
											}}
											cursor={{ stroke: "hsl(var(--muted-foreground))" }}
										/>
										<Area
											type="monotone"
											dataKey="score"
											stroke={pacingColor}
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#pacingGradient)"
											isAnimationActive={true}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>

						<div className="h-[1px] bg-primary/10 w-full" />

						{/* Character Screen Time */}
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
								<Users className="h-3 w-3" />
								<span>Cast Presence</span>
							</div>

							{topCharacters.length === 0 ? (
								<div className="text-xs text-muted-foreground italic text-center py-4">
									No characters detected.
								</div>
							) : (
								<div className="h-48 w-full">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={topCharacters.slice(0, 5)}
											layout="vertical"
											margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
										>
											<XAxis type="number" hide />
											<YAxis
												dataKey="name"
												type="category"
												width={80}
												tick={{
													fontSize: 11,
													fill: "hsl(var(--muted-foreground))",
												}}
												axisLine={false}
												tickLine={false}
											/>
											<RechartsTooltip
												cursor={{ fill: "transparent" }}
												contentStyle={{
													backgroundColor: "hsl(var(--popover))",
													borderColor: "hsl(var(--border))",
													borderRadius: "8px",
													fontSize: "12px",
												}}
											/>
											<Bar
												dataKey="count"
												radius={[0, 4, 4, 0]}
												barSize={20}
												animationDuration={1000}
											>
												{topCharacters.map((_entry, index) => (
													<Cell
														key={_entry.name}
														fill={
															index === 0
																? "hsl(var(--primary))"
																: "hsl(var(--muted-foreground))"
														}
														opacity={index === 0 ? 1 : 0.5}
													/>
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							)}
						</div>
					</div>
				</ScrollArea>
			</GlassCard>
		</motion.div>
	);
}

function StatBox({
	label,
	value,
	subValue,
	icon: Icon,
	color,
}: {
	label: string;
	value: string;
	subValue?: string;
	icon: LucideIcon;
	color?: string;
}) {
	return (
		<div className="flex flex-col p-3 rounded-lg bg-background/40 border border-white/5 shadow-sm hover:bg-background/60 transition-colors">
			<div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
				<Icon className="h-3 w-3" style={{ color }} />
				{label}
			</div>
			<div className="text-xl font-bold tracking-tight text-foreground/90 font-mono">
				{value}
			</div>
			{subValue && (
				<div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
					{subValue}
				</div>
			)}
		</div>
	);
}
