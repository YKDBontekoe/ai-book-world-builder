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

	const { data: sources } = useQuery({
		queryKey: ["jules", "sources"],
		queryFn: async () => {
			const res = await listJulesSourcesAction();
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
	});

	const { data: issues } = useQuery({
		queryKey: ["github", "issues", "open"],
		queryFn: async () => {
			const res = await getIssues("open");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: closedIssues } = useQuery({
		queryKey: ["github", "issues", "closed"],
		queryFn: async () => {
			const res = await getIssues("closed");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: prs } = useQuery({
		queryKey: ["github", "prs", "open"],
		queryFn: async () => {
			const res = await getPullRequests("open");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: closedPrs } = useQuery({
		queryKey: ["github", "prs", "closed"],
		queryFn: async () => {
			const res = await getPullRequests("closed");
			return res.success && Array.isArray(res.data) ? res.data : [];
		},
	});

	const { data: sessions } = useQuery({
		queryKey: ["jules", "sessions"],
		queryFn: async () => {
			const res = await getJulesSessionsAction({ pageSize: 50 });
			return res.success && res.data && Array.isArray(res.data.sessions)
				? res.data.sessions
				: [];
		},
		refetchInterval: 10000,
	});

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

	return {
		sources,
		issues,
		closedIssues,
		prs,
		closedPrs,
		sessions,
		startFix,
	};
}
