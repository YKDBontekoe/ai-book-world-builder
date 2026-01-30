"use client";

import { FolderIcon, Globe, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { CreateProjectDialog } from "@/components/organisms/projects/create-project-dialog";

export function ProjectEmptyState({ filter }: { filter: "mine" | "shared" }) {
	if (filter === "mine") {
		return (
			<EmptyState
				variant="glass"
				title="No projects found"
				description="Create a new story to get started with your first project."
				icon={FolderIcon}
				action={
					<CreateProjectDialog
						trigger={
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								Create Story
							</Button>
						}
					/>
				}
			/>
		);
	}

	return (
		<EmptyState
			variant="glass"
			title="No shared projects"
			description="Explore projects shared by the community here."
			icon={Globe}
		/>
	);
}
