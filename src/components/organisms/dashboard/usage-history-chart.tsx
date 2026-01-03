"use client";

import {
	Area,
	AreaChart,
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
import type { UsageHistory } from "@/lib/dashboard-queries";

export function UsageHistoryChart({ history }: { history: UsageHistory }) {
	const data = history.length > 0 ? history : [];

	return (
		<Card className="glass-card">
			<CardHeader>
				<CardTitle>Usage History</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="cost">
					<TabsList className="mb-4 w-[200px]">
						<TabsTrigger value="cost">Cost</TabsTrigger>
						<TabsTrigger value="tokens">Tokens</TabsTrigger>
					</TabsList>

					<TabsContent value="cost" className="h-[300px]">
						{data.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={data}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
								>
									<defs>
										<linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
										</linearGradient>
									</defs>
									<XAxis
										dataKey="date"
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
										tickFormatter={(value) => `$${value}`}
									/>
									<Tooltip
										contentStyle={{
											borderRadius: "8px",
											border: "none",
											background: "rgba(0,0,0,0.8)",
											color: "#fff",
										}}
										formatter={(value: number) => [
											`$${value.toFixed(4)}`,
											"Cost",
										]}
									/>
									<Area
										type="monotone"
										dataKey="cost"
										stroke="#8884d8"
										fillOpacity={1}
										fill="url(#colorCost)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
								<p>No history data available</p>
								<p className="text-xs">
									Start generating content to see trends
								</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="tokens" className="h-[300px]">
						{data.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={data}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="colorTokens"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
										</linearGradient>
									</defs>
									<XAxis
										dataKey="date"
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<Tooltip
										contentStyle={{
											borderRadius: "8px",
											border: "none",
											background: "rgba(0,0,0,0.8)",
											color: "#fff",
										}}
									/>
									<Area
										type="monotone"
										dataKey="tokens"
										stroke="#82ca9d"
										fillOpacity={1}
										fill="url(#colorTokens)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
								<p>No history data available</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
