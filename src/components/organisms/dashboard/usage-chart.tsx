"use client";

import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/atoms/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/atoms/tabs";
import type { TokenStats } from "@/lib/dashboard-queries";

export function UsageChart({ stats }: { stats: TokenStats }) {
	// Transform data for charts
	const modelData = Object.entries(stats.byModel).map(([model, data]) => ({
		name: model,
		cost: data.cost,
		tokens: data.inputTokens + data.outputTokens,
	}));

	// Sort by cost descending
	modelData.sort((a, b) => b.cost - a.cost);

	return (
		<Card className="glass-card">
			<CardHeader>
				<CardTitle>Usage & Costs</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="cost">
					<TabsList className="mb-4 w-full grid grid-cols-2">
						<TabsTrigger value="cost">Cost ($)</TabsTrigger>
						<TabsTrigger value="tokens">Tokens</TabsTrigger>
					</TabsList>

					<TabsContent value="cost" className="h-[300px]">
						{modelData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={modelData}
									margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
								>
									<XAxis
										dataKey="name"
										stroke="#888888"
										fontSize={10}
										tickLine={false}
										axisLine={false}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
										tickFormatter={(value) => `$${value.toFixed(2)}`}
									/>
									<Tooltip
										cursor={{ fill: "rgba(255,255,255,0.1)" }}
										contentStyle={{
											borderRadius: "8px",
											border: "none",
											background: "rgba(0,0,0,0.8)",
											color: "#fff",
										}}
										formatter={(value: number | undefined) => [
											`$${(value || 0).toFixed(4)}`,
											"Cost",
										]}
									/>
									<Bar
										dataKey="cost"
										fill="currentColor"
										radius={[4, 4, 0, 0]}
										className="fill-primary"
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								No usage data
							</div>
						)}
					</TabsContent>

					<TabsContent value="tokens" className="h-[300px]">
						{modelData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={modelData}
									margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
								>
									<XAxis
										dataKey="name"
										stroke="#888888"
										fontSize={10}
										tickLine={false}
										axisLine={false}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
										tickFormatter={(value) => `${value}`}
									/>
									<Tooltip
										cursor={{ fill: "rgba(255,255,255,0.1)" }}
										contentStyle={{
											borderRadius: "8px",
											border: "none",
											background: "rgba(0,0,0,0.8)",
											color: "#fff",
										}}
									/>
									<Bar
										dataKey="tokens"
										fill="currentColor"
										radius={[4, 4, 0, 0]}
										className="fill-primary"
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								No usage data
							</div>
						)}
					</TabsContent>
				</Tabs>

				<div className="mt-6 grid grid-cols-2 gap-4 text-center border-t border-white/10 pt-4">
					<div>
						<p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
							Total Cost
						</p>
						<p className="text-xl font-bold">${stats.totalCost.toFixed(4)}</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
							Total Tokens
						</p>
						<p className="text-xl font-bold">
							{(
								stats.totalInputTokens + stats.totalOutputTokens
							).toLocaleString()}
						</p>
					</div>
				</div>

				<div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
					<div className="flex justify-between">
						<span>Generation:</span>
						<span>${stats.byFeature.generation.cost.toFixed(4)}</span>
					</div>
					<div className="flex justify-between">
						<span>Chat:</span>
						<span>${stats.byFeature.chat.cost.toFixed(4)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
