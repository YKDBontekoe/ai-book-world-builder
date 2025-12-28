"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/atoms/card";
import type { EntityStats } from "@/lib/dashboard-queries";

const COLORS = [
	"#0ea5e9",
	"#22c55e",
	"#eab308",
	"#f97316",
	"#ef4444",
	"#a855f7",
];

export function EntityInsights({ stats }: { stats: EntityStats }) {
	const data = Object.entries(stats.byKind).map(([name, value]) => ({
		name,
		value,
	}));

	// Capitalize kind names
	const formattedData = data.map((d) => ({
		...d,
		name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
	}));

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card className="glass-card">
					<CardHeader>
						<CardTitle>Entity Distribution</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px] flex flex-col">
						{formattedData.length > 0 ? (
							<>
								<div className="flex-1 min-h-0">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={formattedData}
												cx="50%"
												cy="50%"
												innerRadius={50}
												outerRadius={70}
												paddingAngle={5}
												dataKey="value"
											>
												{formattedData.map((_entry, index) => (
													<Cell
														// biome-ignore lint/suspicious/noArrayIndexKey: "Index is stable here"
														key={`cell-${index}`}
														fill={COLORS[index % COLORS.length]}
													/>
												))}
											</Pie>
											<Tooltip
												contentStyle={{
													borderRadius: "8px",
													border: "none",
													background: "rgba(0,0,0,0.8)",
													color: "#fff",
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
								<div className="flex flex-wrap gap-2 justify-center mt-2">
									{formattedData.map((entry, index) => (
										<div
											key={entry.name}
											className="flex items-center gap-1.5 text-xs"
										>
											<div
												className="w-2.5 h-2.5 rounded-full"
												style={{
													backgroundColor: COLORS[index % COLORS.length],
												}}
											/>
											<span>
												{entry.name}{" "}
												<span className="text-muted-foreground">
													({entry.value})
												</span>
											</span>
										</div>
									))}
								</div>
							</>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
								<p>No entities found</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="glass-card">
					<CardHeader>
						<CardTitle>Top Connected</CardTitle>
					</CardHeader>
					<CardContent>
						{stats.mostConnected.length > 0 ? (
							<ul className="space-y-3">
								{stats.mostConnected.map((entity, i) => (
									<li
										key={entity.id}
										className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
									>
										<div className="flex items-center gap-3">
											<span className="text-muted-foreground font-mono text-xs w-4">
												#{i + 1}
											</span>
											<div>
												<div className="font-medium text-sm">{entity.name}</div>
												<div className="text-[10px] text-muted-foreground uppercase tracking-wider">
													{entity.kind}
												</div>
											</div>
										</div>
										<span className="font-bold text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
											{entity.connections} rels
										</span>
									</li>
								))}
							</ul>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
								<p>No relationships found</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
