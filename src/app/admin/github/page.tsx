import { Bot, Github } from "lucide-react";
import type { JSX } from "react";
import { GitHubDashboard } from "@/components/admin/github/github-dashboard";
import { JulesDashboard } from "@/components/admin/jules/jules-dashboard";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/atoms/tabs";

/**
 * Admin page for managing GitHub integration and Jules agent sessions.
 * @returns The GitHubAdminPage component.
 */
export default function GitHubAdminPage(): JSX.Element {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					GitHub & Agent Management
				</h1>
				<p className="text-muted-foreground mt-2">
					Manage pull requests, issues, and Jules agent sessions.
				</p>
			</div>

			<Tabs defaultValue="jules" className="w-full">
				<TabsList className="grid w-full grid-cols-2 max-w-[400px]">
					<TabsTrigger value="jules" className="gap-2">
						<Bot className="h-4 w-4" />
						Jules Agent
					</TabsTrigger>
					<TabsTrigger value="github" className="gap-2">
						<Github className="h-4 w-4" />
						GitHub
					</TabsTrigger>
				</TabsList>

				<TabsContent value="jules" className="mt-6">
					<JulesDashboard />
				</TabsContent>

				<TabsContent value="github" className="mt-6">
					<GitHubDashboard />
				</TabsContent>
			</Tabs>
		</div>
	);
}
