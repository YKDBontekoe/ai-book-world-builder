"use client";

import { type JSX, useState } from "react";
import { JulesChat } from "./jules-chat";
import { JulesSessionList } from "./jules-session-list";
import { JulesSessionSetup } from "./jules-session-setup";

/**
 * Dashboard component for managing Jules agent sessions and sources.
 * @returns The JulesDashboard component.
 */
export function JulesDashboard(): JSX.Element {
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);

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
			<div>
				<h2 className="text-xl font-semibold">Jules Console</h2>
				<p className="text-sm text-muted-foreground">
					Configure repositories, approve plans, and track Jules execution.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[380px_1fr]">
				<JulesSessionSetup onSessionCreated={setSelectedSessionId} />
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Active Sessions</h3>
					</div>
					<JulesSessionList onSelectSession={setSelectedSessionId} />
				</div>
			</div>
		</div>
	);
}
