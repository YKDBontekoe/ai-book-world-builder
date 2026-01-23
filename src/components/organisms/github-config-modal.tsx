"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listGitHubRepositoriesAction } from "@/app/actions/github";
import {
	getJulesPreferencesAction,
	saveJulesPreferencesAction,
} from "@/app/actions/jules-preferences";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import { Label } from "@/components/atoms/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";

interface GitHubConfigModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function GitHubConfigModal({
	isOpen,
	onOpenChange,
	onSuccess,
}: GitHubConfigModalProps): JSX.Element {
	const queryClient = useQueryClient();
	const [selectedRepo, setSelectedRepo] = useState<string>("");

	// Load existing preferences
	const { data: preferences } = useQuery({
		queryKey: ["user-preferences", "jules"],
		queryFn: async () => {
			const result = await getJulesPreferencesAction();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: isOpen,
	});

	// Load repositories
	const { data: repositories, isLoading: isLoadingRepos } = useQuery({
		queryKey: ["github", "repositories"],
		queryFn: async () => {
			const result = await listGitHubRepositoriesAction();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: isOpen,
	});

	// Initialize selection from preferences
	useEffect(() => {
		if (preferences?.repository) {
			setSelectedRepo(preferences.repository);
		}
	}, [preferences]);

	const { mutate: savePreferences, isPending: isSaving } = useMutation({
		mutationFn: async () => {
			const result = await saveJulesPreferencesAction({
				repository: selectedRepo,
				branch: preferences?.branch ?? null, // Keep existing branch if any
			});
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		onSuccess: () => {
			toast.success("GitHub configuration saved");
			queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
			queryClient.invalidateQueries({ queryKey: ["github"] });
			onSuccess?.();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to save configuration",
			);
		},
	});

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Configure GitHub Repository</DialogTitle>
					<DialogDescription>
						Select the repository you want to use for this project.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="repo-select-trigger">Repository</Label>
						<Select
							value={selectedRepo}
							onValueChange={setSelectedRepo}
							disabled={isLoadingRepos || isSaving}
						>
							<SelectTrigger id="repo-select-trigger">
								<SelectValue placeholder="Select a repository" />
							</SelectTrigger>
							<SelectContent>
								{repositories?.map((repo) => (
									<SelectItem key={repo.id} value={repo.fullName}>
										{repo.fullName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button
						onClick={() => savePreferences()}
						disabled={!selectedRepo || isSaving}
					>
						{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Configuration
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
