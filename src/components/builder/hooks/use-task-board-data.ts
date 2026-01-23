"use client";

import {
	type UseMutateFunction,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { startFixSessionAction } from "@/app/actions/builder";
import type { GitHubIssue, GitHubPR } from "@/app/actions/github";
import { getIssues, getPullRequests } from "@/app/actions/github";
import {
	getJulesSessionsAction,
	listJulesSourcesAction,
} from "@/app/actions/jules";
import type { JulesSession, JulesSource } from "@/lib/jules-client";

export interface TaskBoardDataResult {
	sources: JulesSource[] | undefined;
	issues: GitHubIssue[] | undefined;
	closedIssues: GitHubIssue[] | undefined;
	prs: GitHubPR[] | undefined;
	closedPrs: GitHubPR[] | undefined;
	sessions: JulesSession[] | undefined;
	startFix: UseMutateFunction<JulesSession, Error, GitHubIssue, unknown>;
	isLoading: boolean;
	isError: boolean;
}

export function useTaskBoardData(): TaskBoardDataResult {
	const queryClient = useQueryClient();

	const {
		data: sources,
		isLoading: isLoadingSources,
		isError: isErrorSources,
	} = useQuery({
		queryKey: ["jules", "sources"],
		queryFn: async () => {
			const res = await listJulesSourcesAction();
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
	});

	const {
		data: issues,
		isLoading: isLoadingIssues,
		isError: isErrorIssues,
	} = useQuery({
		queryKey: ["github", "issues", "open"],
		queryFn: async () => {
			const res = await getIssues("open");
			if (!res.success) throw new Error(res.error);
			if (!Array.isArray(res.data))
				throw new Error("Invalid response format for issues");
			return res.data;
		},
	});

	const {
		data: closedIssues,
		isLoading: isLoadingClosedIssues,
		isError: isErrorClosedIssues,
	} = useQuery({
		queryKey: ["github", "issues", "closed"],
		queryFn: async () => {
			const res = await getIssues("closed");
			if (!res.success) throw new Error(res.error);
			if (!Array.isArray(res.data))
				throw new Error("Invalid response format for issues");
			return res.data;
		},
	});

	const {
		data: prs,
		isLoading: isLoadingPrs,
		isError: isErrorPrs,
	} = useQuery({
		queryKey: ["github", "prs", "open"],
		queryFn: async () => {
			const res = await getPullRequests("open");
			if (!res.success) throw new Error(res.error);
			if (!Array.isArray(res.data))
				throw new Error("Invalid response format for PRs");
			return res.data;
		},
	});

	const {
		data: closedPrs,
		isLoading: isLoadingClosedPrs,
		isError: isErrorClosedPrs,
	} = useQuery({
		queryKey: ["github", "prs", "closed"],
		queryFn: async () => {
			const res = await getPullRequests("closed");
			if (!res.success) throw new Error(res.error);
			if (!Array.isArray(res.data))
				throw new Error("Invalid response format for PRs");
			return res.data;
		},
	});

	const {
		data: sessions,
		isLoading: isLoadingSessions,
		isError: isErrorSessions,
	} = useQuery({
		queryKey: ["jules", "sessions"],
		queryFn: async () => {
			const res = await getJulesSessionsAction({ pageSize: 50 });
			if (!res.success) throw new Error(res.error);
			return res.data && Array.isArray(res.data.sessions)
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

	const isLoading =
		isLoadingSources ||
		isLoadingIssues ||
		isLoadingClosedIssues ||
		isLoadingPrs ||
		isLoadingClosedPrs ||
		isLoadingSessions;

	const isError =
		isErrorSources ||
		isErrorIssues ||
		isErrorClosedIssues ||
		isErrorPrs ||
		isErrorClosedPrs ||
		isErrorSessions;

	return {
		sources,
		issues,
		closedIssues,
		prs,
		closedPrs,
		sessions,
		startFix,
		isLoading,
		isError,
	};
}
