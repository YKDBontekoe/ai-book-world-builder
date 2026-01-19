"use client";

import { Globe, Loader2, Lock, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { createProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/atoms/dialog";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { generateRandomTitle } from "@/lib/random-title";
import { PROJECT_TEMPLATES } from "@/lib/templates";

interface CreateProjectDialogProps {
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function CreateProjectDialog({
	trigger,
	open: controlledOpen,
	onOpenChange,
}: CreateProjectDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;
	const setOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useLocalStorage<VisibilityType>(
		"create-project-visibility",
		"private",
	);
	const [templateId, setTemplateId] = useLocalStorage<string>(
		"create-project-template",
		"blank",
	);

	useEffect(() => {
		if (open) {
			setName("");
			setDescription("");
			// We intentionally do NOT reset visibility and templateId to preserve user preference (Smart Defaults)
		}
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setIsLoading(true);
		try {
			const result = await createProjectAction({
				name,
				description,
				visibility,
				templateId,
			});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			if (result.projectId) {
				toast.success("Project created successfully");
				setOpen(false);
				router.push(`/projects/${result.projectId}`);
			}
		} catch (_error) {
			toast.error("Failed to create project");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
						Create Project
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
					<DialogDescription>
						Start a new story. You can add scenes, characters, and chapters
						later.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<div className="relative">
							<Input
								id="name"
								placeholder="The Great Adventure"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								autoFocus
								className="pr-10"
							/>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											type="button"
											size="icon"
											variant="ghost"
											className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
											onClick={() => setName(generateRandomTitle())}
										>
											<Sparkles className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Surprise me with a title</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="A short summary of your story..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="glass-input resize-none"
							rows={3}
							submitOnCtrlEnter
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="template">Template</Label>
							<Select value={templateId} onValueChange={setTemplateId}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PROJECT_TEMPLATES.map((template) => (
										<SelectItem key={template.id} value={template.id}>
											<span className="font-medium">{template.name}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="visibility">Visibility</Label>
							<Select
								value={visibility}
								onValueChange={(v) => setVisibility(v as VisibilityType)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="private">
										<div className="flex items-center gap-2">
											<Lock className="h-4 w-4" />
											<span>Private</span>
										</div>
									</SelectItem>
									<SelectItem value="public">
										<div className="flex items-center gap-2">
											<Globe className="h-4 w-4" />
											<span>Public</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter className="pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || !name.trim()}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create Project
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
