"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { startFixSessionAction } from "@/app/actions/builder";
import type { GitHubIssue } from "@/app/actions/github";
import { getIssues, getPullRequests } from "@/app/actions/github";
import {
	getJulesSessionsAction,
	listJulesSourcesAction,
} from "@/app/actions/jules";

export function useTaskBoardData() {
	const queryClient = useQueryClient();

	// --- Queries ---

	const { data: sources } = useQuery({
		queryKey: ["jules", "sources"],
		queryFn: async () => {
			const res = await listJulesSourcesAction();
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
	});

	const {
		data: issues,
		error: issuesError,
		isLoading: issuesLoading,
	} = useQuery({
		queryKey: ["github", "issues", "open"],
		queryFn: async () => {
			const res = await getIssues("open");
			if (!res.success) {
				if (res.error === "GITHUB_CONFIG_MISSING") {
					throw new Error(res.error);
				}
				throw new Error(res.error);
			}
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const {
		data: closedIssues,
		error: closedIssuesError,
		isLoading: closedIssuesLoading,
	} = useQuery({
		queryKey: ["github", "issues", "closed"],
		queryFn: async () => {
			const res = await getIssues("closed");
			if (!res.success) throw new Error(res.error);
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const {
		data: prs,
		error: prsError,
		isLoading: prsLoading,
	} = useQuery({
		queryKey: ["github", "prs", "open"],
		queryFn: async () => {
			const res = await getPullRequests("open");
			if (!res.success) throw new Error(res.error);
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const {
		data: closedPrs,
		error: closedPrsError,
		isLoading: closedPrsLoading,
	} = useQuery({
		queryKey: ["github", "prs", "closed"],
		queryFn: async () => {
			const res = await getPullRequests("closed");
			if (!res.success) throw new Error(res.error);
			return Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: sessions, isLoading: sessionsLoading } = useQuery({
		queryKey: ["jules", "sessions"],
		queryFn: async () => {
			const res = await getJulesSessionsAction({ pageSize: 50 });
			return res.success && res.data && Array.isArray(res.data.sessions)
				? res.data.sessions
				: [];
		},
		refetchInterval: 10000, // Poll for session updates
	});

	// --- Mutations ---

	const { mutate: startFix } = useMutation({
		mutationFn: async (issue: GitHubIssue) => {
			const res = await startFixSessionAction({ issueNumber: issue.number });
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: (_newSession) => {
			toast.success("Jules is working on the fix!");
			queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
		},
		onError: (err) => {
			toast.error(`Failed to start fix: ${err.message}`);
		},
	});

	const isLoading =
		issuesLoading ||
		closedIssuesLoading ||
		prsLoading ||
		closedPrsLoading ||
		sessionsLoading;

	return {
		sources,
		issues,
		issuesError,
		closedIssues,
		closedIssuesError,
		prs,
		prsError,
		closedPrs,
		closedPrsError,
		sessions,
		startFix,
		isLoading,
	};
}
