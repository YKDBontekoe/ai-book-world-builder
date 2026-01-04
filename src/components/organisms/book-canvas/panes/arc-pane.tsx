"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import {
	Area,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { analyzeProjectPacingAction } from "@/app/actions/analysis";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";

export function ArcPane() {
	const { projectId, activePane } = useBookCanvas();
	const { theme } = useTheme();

	const { data: pacingResult, isLoading } = useQuery({
		queryKey: ["pacing", projectId],
		queryFn: async () => {
			if (!projectId) return null;
			return analyzeProjectPacingAction({ projectId });
		},
		enabled: !!projectId && activePane === "arc",
	});

	if (!projectId) {
		return (
			<EmptyState
				icon={TrendingUp}
				title="No Project Selected"
				description="Select a project to view the story arc"
				className="h-full m-4"
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	const chartData = pacingResult?.success ? pacingResult.data : [];

	if (!chartData || chartData.length === 0) {
		return (
			<EmptyState
				icon={TrendingUp}
				title="Not Enough Data"
				description="Add scenes to visualize the story arc"
				className="h-full m-4"
			/>
		);
	}

	const isDark = theme === "dark";

	return (
		<div className="flex flex-col h-full w-full p-4 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Story Arc & Pacing</h3>
					<p className="text-xs text-muted-foreground">
						Visualizing narrative tension and scene pacing
					</p>
				</div>
			</div>

			<div className="flex-1 w-full min-h-[300px] bg-card/50 rounded-lg border p-4">
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart
						data={chartData}
						margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
					>
						<defs>
							<linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={isDark ? "#333" : "#eee"}
							vertical={false}
						/>
						<XAxis
							dataKey="title"
							tick={{ fontSize: 10, fill: isDark ? "#888" : "#666" }}
							tickLine={false}
							axisLine={false}
							interval="preserveStartEnd"
							tickFormatter={(value) =>
								value.length > 15 ? `${value.substring(0, 15)}...` : value
							}
						/>
						<YAxis
							yAxisId="left"
							domain={[0, 10]}
							hide
							label={{ value: "Tension", angle: -90, position: "insideLeft" }}
						/>
						<YAxis
							yAxisId="right"
							orientation="right"
							domain={[0, 10]}
							hide
							label={{ value: "Pacing", angle: 90, position: "insideRight" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--popover))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "var(--radius)",
								color: "hsl(var(--popover-foreground))",
							}}
							itemStyle={{ fontSize: 12 }}
							labelStyle={{
								fontSize: 12,
								fontWeight: "bold",
								marginBottom: 4,
							}}
						/>
						<Legend
							wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
							iconType="circle"
						/>

						{/* Tension Area */}
						<Area
							yAxisId="left"
							type="monotone"
							dataKey="tension"
							name="Narrative Tension"
							stroke="hsl(var(--primary))"
							fillOpacity={1}
							fill="url(#colorTension)"
							strokeWidth={2}
						/>

						{/* Pacing Line */}
						<Line
							yAxisId="right"
							type="monotone"
							dataKey="pacing"
							name="Scene Pacing"
							stroke="#fbbf24"
							strokeWidth={2}
							dot={{ r: 3, fill: "#fbbf24" }}
							activeDot={{ r: 5 }}
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="p-3 rounded-lg border bg-muted/20 text-xs">
					<h4 className="font-semibold mb-1 text-primary">Tension Analysis</h4>
					<p className="text-muted-foreground">
						Derived from atmospheric keywords (e.g., "dark", "urgent") and number
						of emotional beats per scene. Higher peaks indicate climax points.
					</p>
				</div>
				<div className="p-3 rounded-lg border bg-muted/20 text-xs">
					<h4 className="font-semibold mb-1 text-amber-500">Pacing Analysis</h4>
					<p className="text-muted-foreground">
						Calculated based on scene length and dialogue density. Higher values
						suggest faster, action-oriented or dialogue-heavy scenes.
					</p>
				</div>
			</div>
		</div>
	);
}
