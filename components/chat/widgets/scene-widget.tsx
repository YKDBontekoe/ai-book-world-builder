"use client";

import {
	ClapperboardIcon,
	Edit3Icon,
	FileTextIcon,
	Loader2,
	Pencil,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { toast } from "sonner";
import { updateSceneAction } from "@/app/actions/scenes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { InteractiveWidget } from "./interactive-widget";

export interface SceneWidgetProps {
	scene: {
		id: string;
		title: string;
		status: string;
		content?: string | null;
		sequence: number;
		projectId?: string;
	};
	projectId?: string;
}

const statusColors = {
	planned: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
	drafted:
		"text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
	completed:
		"text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
	revised:
		"text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
};

export function SceneWidget({ scene, projectId }: SceneWidgetProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Edit state
	const [title, setTitle] = useState(scene.title);
	const [status, setStatus] = useState(scene.status);

	const statusColor =
		statusColors[scene.status as keyof typeof statusColors] ||
		"text-zinc-600 bg-zinc-100";

	const handleSave = async () => {
		if (!projectId && !scene.projectId) return;

		setIsSaving(true);
		try {
			await updateSceneAction({
				id: scene.id,
				projectId: projectId ?? scene.projectId!,
				title,
				status,
			});
			setIsEditing(false);
			toast.success("Scene updated");
		} catch (error) {
			toast.error("Failed to update scene");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const idPrefix = useId();

	if (isEditing) {
		return (
			<InteractiveWidget
				isEditing={true}
				headerIcon={<ClapperboardIcon size={18} className="text-primary" />}
				headerTitle="Edit Scene"
				headerColor="bg-primary/10 ring-primary/20"
			>
				<div className="flex flex-col gap-4 p-4">
					<div className="space-y-1">
						<Label htmlFor={`${idPrefix}-title`} className="text-xs">
							Title
						</Label>
						<Input
							id={`${idPrefix}-title`}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="h-8 text-sm"
						/>
					</div>

					<div className="space-y-1">
						<Label htmlFor={`${idPrefix}-status`} className="text-xs">
							Status
						</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="h-8 text-sm">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="planned">Planned</SelectItem>
								<SelectItem value="drafted">Drafted</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="revised">Revised</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditing(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button size="sm" onClick={handleSave} disabled={isSaving}>
							{isSaving && <Loader2 className="mr-2 size-3 animate-spin" />}
							Save Changes
						</Button>
					</div>
				</div>
			</InteractiveWidget>
		);
	}

	return (
		<InteractiveWidget
			headerIcon={<ClapperboardIcon size={18} className="text-primary" />}
			headerTitle={title}
			headerSubtitle={`Seq: ${scene.sequence}`}
			headerColor="bg-primary/10 ring-primary/20"
		>
			<div className="relative flex flex-col">
				<div className="absolute top-3 right-4">
					<span
						className={cn(
							"rounded-full px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider",
							statusColor,
						)}
					>
						{status}
					</span>
				</div>

				{scene.content && (
					<div className="px-4 py-8 text-muted-foreground text-sm leading-relaxed line-clamp-3">
						<div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-foreground/80">
							<FileTextIcon size={12} />
							<span>Preview</span>
						</div>
						{scene.content}
					</div>
				)}

				{!scene.content && (
					<div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
						No content generated yet.
					</div>
				)}

				<div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2">
					{projectId || scene.projectId ? (
						<Link
							className="flex items-center gap-1.5 text-primary text-xs hover:underline"
							href={`/projects/${projectId || scene.projectId}/drafts`}
						>
							<Edit3Icon size={12} />
							Open in Draft
						</Link>
					) : (
						<span />
					)}

					<Button
						variant="ghost"
						size="sm"
						className="h-6 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
						onClick={() => setIsEditing(true)}
					>
						<Pencil size={10} />
						Edit
					</Button>
				</div>
			</div>
		</InteractiveWidget>
	);
}
