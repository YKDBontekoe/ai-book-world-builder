"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	listGitHubBranchesAction,
	listGitHubRepositoriesAction,
} from "@/app/actions/github";
import {
	getJulesPreferencesAction,
	saveJulesPreferencesAction,
} from "@/app/actions/jules-preferences";
import {
	createJulesAdminSessionAction,
	listJulesSourcesAction,
} from "@/app/actions/jules";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Textarea } from "@/components/atoms/textarea";
import { GlassCard } from "@/components/molecules/glass-card";
import type { GitHubBranch, GitHubRepository } from "@/lib/github-types";
import type { JulesSource } from "@/lib/jules-client";

export interface JulesSessionSetupProps {
	onSessionCreated: (sessionId: string) => void;
	presetData?: JulesSessionSetupPreset;
}

export interface JulesSessionSetupPreset {
	repositories: GitHubRepository[];
	branches: GitHubBranch[];
	sources: JulesSource[];
}

type JulesPreferences = {
	repository: string | null;
	branch: string | null;
};

export function JulesSessionSetup({
	onSessionCreated,
	presetData,
}: JulesSessionSetupProps): JSX.Element {
	const queryClient = useQueryClient();
	const [prompt, setPrompt] = useState("");
	const [title, setTitle] = useState("");
	const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(
		null,
	);
	const [selectedBranch, setSelectedBranch] = useState<string>("");
	const [automationMode, setAutomationMode] = useState<"manual" | "auto">(
		"manual",
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [hasAppliedPreferences, setHasAppliedPreferences] = useState(false);

	const { data: sources } = useQuery({
		queryKey: ["jules", "sources"],
		queryFn: async () => {
			const result = await listJulesSourcesAction();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		initialData: presetData?.sources,
		enabled: !presetData,
	});

	const {
		data: preferences,
		isSuccess: hasPreferences,
		isLoading: isLoadingPreferences,
	} = useQuery({
		queryKey: ["user-preferences", "jules"],
		queryFn: async (): Promise<JulesPreferences> => {
			const result = await getJulesPreferencesAction();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !presetData,
	});

	const {
		data: repositories,
		isLoading: isLoadingRepos,
		error: reposError,
	} = useQuery({
		queryKey: ["github", "repositories"],
		queryFn: async () => {
			const result = await listGitHubRepositoriesAction();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		initialData: presetData?.repositories,
		enabled: !presetData,
	});

	const { mutate: savePreferences } = useMutation({
		mutationFn: async (nextPreferences: JulesPreferences) => {
			const result = await saveJulesPreferencesAction(nextPreferences);
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		onError: (error) => {
			const message =
				error instanceof Error
					? error.message
					: "Unable to save preferences";
			toast.error(message);
		},
	});

	const {
		data: branches,
		isLoading: isLoadingBranches,
		error: branchesError,
	} = useQuery({
		queryKey: ["github", "branches", selectedRepo?.fullName],
		queryFn: async () => {
			if (!selectedRepo) return [];
			const result = await listGitHubBranchesAction({
				repoFullName: selectedRepo.fullName,
			});
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		initialData: presetData?.branches ?? [],
		enabled: !presetData && !!selectedRepo,
	});

	const matchingSource = useMemo(() => {
		if (!selectedRepo) return null;
		const owner = selectedRepo.owner.toLowerCase();
		const repo = selectedRepo.name.toLowerCase();
		return sources?.find((source) => {
			return (
				source.githubRepo.owner.toLowerCase() === owner &&
				source.githubRepo.repo.toLowerCase() === repo
			);
		});
	}, [sources, selectedRepo]);

	const { mutate: createSession, isPending } = useMutation({
		mutationFn: async () => {
			if (!selectedRepo) {
				throw new Error("Select a repository first");
			}
			if (!selectedBranch) {
				throw new Error("Select a base branch first");
			}
			if (!matchingSource) {
				throw new Error(
					"Selected repository is not available as a Jules source",
				);
			}
			const result = await createJulesAdminSessionAction({
				prompt,
				title: title || undefined,
				sourceName: matchingSource.name,
				startingBranch: selectedBranch,
				automationMode,
				repository: selectedRepo,
			});
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		onSuccess: (session) => {
			setPrompt("");
			setTitle("");
			setSelectedBranch("");
			setAutomationMode("manual");
			setErrorMessage(null);
			toast.success("Jules session started");
			queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
			onSessionCreated(session.name);
		},
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : "Failed to start session";
			setErrorMessage(message);
			toast.error(message);
		},
	});

	const repositoriesOptions = repositories ?? [];
	const branchOptions = branches ?? [];

	useEffect(() => {
		if (
			!hasPreferences ||
			hasAppliedPreferences ||
			repositoriesOptions.length === 0
		) {
			return;
		}

		if (preferences?.repository) {
			const repo = repositoriesOptions.find(
				(option) => option.fullName === preferences.repository,
			);
			if (repo) {
				setSelectedRepo(repo);
			}
		}

		setHasAppliedPreferences(true);
	}, [
		hasAppliedPreferences,
		hasPreferences,
		preferences?.repository,
		repositoriesOptions,
	]);

	useEffect(() => {
		if (!selectedRepo || branchOptions.length === 0) return;

		const branchNames = new Set(branchOptions.map((branch) => branch.name));
		const storedBranch =
			preferences?.repository === selectedRepo.fullName
				? preferences.branch
				: null;

		if (selectedBranch && branchNames.has(selectedBranch)) {
			return;
		}

		const fallbackBranch = branchOptions.find(
			(branch) => branch.name === selectedRepo.defaultBranch,
		);
		const nextBranch =
			(storedBranch && branchNames.has(storedBranch) && storedBranch) ||
			fallbackBranch?.name ||
			branchOptions[0]?.name ||
			"";

		if (nextBranch && nextBranch !== selectedBranch) {
			setSelectedBranch(nextBranch);
		}
	}, [
		branchOptions,
		preferences?.branch,
		preferences?.repository,
		selectedBranch,
		selectedRepo,
	]);

	useEffect(() => {
		if (!hasAppliedPreferences || presetData) return;
		const repository = selectedRepo?.fullName ?? null;
		const branch = selectedBranch || null;

		if (repository === preferences?.repository && branch === preferences.branch) {
			return;
		}

		savePreferences({ repository, branch });
	}, [
		hasAppliedPreferences,
		preferences?.branch,
		preferences?.repository,
		presetData,
		savePreferences,
		selectedBranch,
		selectedRepo,
	]);

	return (
		<GlassCard className="p-6 space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Start a Jules Session</h2>
				<p className="text-sm text-muted-foreground">
					Select the repository, base branch, and automation mode before
					starting your session.
				</p>
			</div>

			{(reposError || branchesError) && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Unable to load GitHub data</AlertTitle>
					<AlertDescription className="space-y-2">
						<p>Please retry fetching repositories or branches.</p>
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								queryClient.invalidateQueries({
									queryKey: ["github"],
								})
							}
						>
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			)}

			{errorMessage && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Session blocked</AlertTitle>
					<AlertDescription className="space-y-2">
						<p>{errorMessage}</p>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setErrorMessage(null)}
						>
							Adjust configuration
						</Button>
					</AlertDescription>
				</Alert>
			)}

			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Repository</Label>
					<Select
						value={selectedRepo?.fullName ?? ""}
						onValueChange={(value) => {
							const repo = repositoriesOptions.find(
								(option) => option.fullName === value,
							);
							setSelectedRepo(repo ?? null);
							setSelectedBranch("");
							setHasAppliedPreferences(true);
						}}
						disabled={isLoadingRepos || isLoadingPreferences}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a repository" />
						</SelectTrigger>
						<SelectContent>
							{repositoriesOptions.map((repo) => (
								<SelectItem key={repo.id} value={repo.fullName}>
									{repo.fullName}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{matchingSource ? (
						<Badge variant="secondary" className="mt-2">
							Jules source connected
						</Badge>
					) : selectedRepo ? (
						<Badge variant="destructive" className="mt-2">
							No Jules source for this repo
						</Badge>
					) : null}
				</div>

				<div className="space-y-2">
					<Label>Base Branch</Label>
					<Select
						value={selectedBranch}
						onValueChange={setSelectedBranch}
						disabled={
							!selectedRepo || isLoadingBranches || isLoadingPreferences
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a base branch" />
						</SelectTrigger>
						<SelectContent>
							{branchOptions.map((branch) => (
								<SelectItem key={branch.name} value={branch.name}>
									{branch.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Automation Mode</Label>
					<Select
						value={automationMode}
						onValueChange={(value) =>
							setAutomationMode(value as "manual" | "auto")
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Choose automation mode" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="manual">Manual plan approval</SelectItem>
							<SelectItem value="auto">Auto execute</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Session Title (optional)</Label>
					<Input
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="e.g. Improve onboarding flow"
					/>
				</div>

				<div className="space-y-2">
					<Label>Initial Prompt</Label>
					<Textarea
						value={prompt}
						onChange={(event) => setPrompt(event.target.value)}
						placeholder="Describe what you want Jules to accomplish..."
						className="h-32"
					/>
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="text-xs text-muted-foreground">
					{selectedRepo && selectedBranch ? (
						<span>
							Active: {selectedRepo.fullName} @ {selectedBranch}
						</span>
					) : (
						"Select repository and branch to continue"
					)}
				</div>
				<Button
					onClick={() => createSession()}
					disabled={
						isPending ||
						!prompt.trim() ||
						!selectedRepo ||
						!selectedBranch ||
						!matchingSource
					}
					className="gap-2"
				>
					{isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Sparkles className="h-4 w-4" />
					)}
					Start Session
				</Button>
			</div>
		</GlassCard>
	);
}
