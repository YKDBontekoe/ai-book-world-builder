"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listJulesSourcesAction } from "@/app/actions/jules";
import { CreateSessionDialog } from "./create-session-dialog";
import { JulesChat } from "./jules-chat";
import { JulesSessionList } from "./jules-session-list";

export function JulesDashboard() {
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);

	// Fetch sources to find the default one for the current repo
	const { data: sourcesData } = useQuery({
		queryKey: ["jules", "sources"],
		queryFn: () => listJulesSourcesAction(),
	});

	// Simple heuristic: pick the first source as default for now,
	// or match against env vars if we had them available client-side.
	const defaultSource = sourcesData?.data?.[0]?.name;

	if (selectedSessionId) {
		return (
			<JulesChat
				sessionId={selectedSessionId}
				onBack={() => setSelectedSessionId(null)}
			/>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold">Jules Sessions</h2>
					<p className="text-sm text-muted-foreground">
						Manage your AI agent sessions and tasks.
					</p>
				</div>
				{defaultSource && <CreateSessionDialog defaultSource={defaultSource} />}
			</div>

			<JulesSessionList onSelectSession={setSelectedSessionId} />
		</div>
	);
}
