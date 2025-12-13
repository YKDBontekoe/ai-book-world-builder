"use client";

import { BookTemplate, Save, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { GridList } from "@/components/ui/grid-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SelectionCard } from "@/components/ui/selection-card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import type { GenerationSettings } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface Template {
	id: string;
	name: string;
	description: string | null;
	settings: GenerationSettings;
	isBuiltIn: boolean;
}

interface TemplateManagerProps {
	projectId: string;
	currentSettings: Partial<GenerationSettings>;
	onApplyTemplate: (settings: GenerationSettings) => void;
}

const BUILT_IN_TEMPLATES: Template[] = [
	{
		id: "quick-draft",
		name: "Quick Draft",
		description:
			"Fast generation with minimal revisions. Great for first drafts.",
		isBuiltIn: true,
		settings: {
			totalChapters: 10,
			pagesPerChapter: 8,
			revisionRounds: 1,
			writingStylePreset: "custom",
			writerModelId: "openai-gpt-4o-mini",
			reviewerModelId: "openai-gpt-4o-mini",
			includePrologue: false,
			includeEpilogue: false,
			generateBackCoverBlurb: true,
			generateFrontCover: false,
			generateCharacterSheets: false,
			generateChapterSummaries: true,
			generateTableOfContents: true,
			runConsistencyCheck: false,
		} as GenerationSettings,
	},
	{
		id: "literary-novel",
		name: "Literary Novel",
		description:
			"High-quality output with multiple revision rounds for polished prose.",
		isBuiltIn: true,
		settings: {
			totalChapters: 20,
			pagesPerChapter: 15,
			revisionRounds: 3,
			writingStylePreset: "tolkien",
			writerModelId: "anthropic-claude-sonnet-4-5",
			reviewerModelId: "anthropic-claude-sonnet-4-5",
			includePrologue: true,
			includeEpilogue: true,
			generateBackCoverBlurb: true,
			generateFrontCover: true,
			generateCharacterSheets: true,
			generateChapterSummaries: true,
			generateTableOfContents: true,
			runConsistencyCheck: true,
		} as GenerationSettings,
	},
	{
		id: "thriller-paced",
		name: "Thriller",
		description: "Fast-paced with short chapters and punchy prose.",
		isBuiltIn: true,
		settings: {
			totalChapters: 30,
			pagesPerChapter: 6,
			revisionRounds: 2,
			writingStylePreset: "king",
			writerModelId: "anthropic-claude-sonnet-4-5",
			reviewerModelId: "openai-gpt-4o-mini",
			includePrologue: true,
			includeEpilogue: false,
			generateBackCoverBlurb: true,
			generateFrontCover: true,
			generateCharacterSheets: false,
			generateChapterSummaries: true,
			generateTableOfContents: true,
			runConsistencyCheck: true,
		} as GenerationSettings,
	},
	{
		id: "short-story",
		name: "Short Story",
		description: "Compact narrative perfect for novellas or short fiction.",
		isBuiltIn: true,
		settings: {
			totalChapters: 5,
			pagesPerChapter: 10,
			revisionRounds: 2,
			writingStylePreset: "hemingway",
			writerModelId: "anthropic-claude-sonnet-4-5",
			reviewerModelId: "openai-gpt-4o-mini",
			includePrologue: false,
			includeEpilogue: true,
			generateBackCoverBlurb: true,
			generateFrontCover: false,
			generateCharacterSheets: false,
			generateChapterSummaries: false,
			generateTableOfContents: false,
			runConsistencyCheck: false,
		} as GenerationSettings,
	},
];

export function TemplateManager({
	projectId,
	currentSettings,
	onApplyTemplate,
}: TemplateManagerProps) {
	const queryClient = useQueryClient();
	const { data: userTemplates = [] } = useQuery({
		queryKey: ["templates", projectId],
		queryFn: () => api.get<Template[]>("/api/generation/templates"),
	});

	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null,
	);
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [newTemplateName, setNewTemplateName] = useState("");
	const [newTemplateDescription, setNewTemplateDescription] = useState("");

	const createTemplate = useMutation({
		mutationFn: (data: {
			name: string;
			description: string;
			settings: Partial<GenerationSettings>;
		}) => api.post("/api/generation/templates", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
			setShowSaveDialog(false);
			setNewTemplateName("");
			setNewTemplateDescription("");
		},
		onError: (error) => {
			console.error("Failed to save template:", error);
		},
	});

	const deleteTemplate = useMutation({
		mutationFn: (templateId: string) =>
			api.delete(`/api/generation/templates/${templateId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
		},
		onError: (error) => {
			console.error("Failed to delete template:", error);
		},
	});

	const handleApplyTemplate = (template: Template) => {
		setSelectedTemplateId(template.id);
		onApplyTemplate(template.settings);
	};

	const handleSaveAsTemplate = () => {
		if (!newTemplateName.trim()) return;
		createTemplate.mutate({
			name: newTemplateName,
			description: newTemplateDescription,
			settings: currentSettings,
		});
	};

	const handleDeleteTemplate = (templateId: string) => {
		deleteTemplate.mutate(templateId);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<SectionHeader
					title="Generation Templates"
					className="w-full"
					action={
						<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="gap-1.5">
									<Save className="h-3.5 w-3.5" />
									Save Current
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Save as Template</DialogTitle>
									<DialogDescription>
										Save your current generation settings as a reusable
										template.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="template-name">Template Name</Label>
										<Input
											id="template-name"
											placeholder="My Custom Template"
											value={newTemplateName}
											onChange={(e) => setNewTemplateName(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="template-description">
											Description (optional)
										</Label>
										<Textarea
											id="template-description"
											placeholder="Describe when to use this template..."
											value={newTemplateDescription}
											onChange={(e) =>
												setNewTemplateDescription(e.target.value)
											}
											rows={3}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setShowSaveDialog(false)}
									>
										Cancel
									</Button>
									<Button
										onClick={handleSaveAsTemplate}
										disabled={createTemplate.isPending || !newTemplateName.trim()}
									>
										{createTemplate.isPending ? "Saving..." : "Save Template"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					}
				/>
			</div>

			{/* Built-in Templates */}
			<div className="grid gap-2">
				<p className="text-xs text-muted-foreground uppercase tracking-wide">
					Built-in
				</p>
				<GridList columns={{ mobile: 1, sm: 2 }} gap={2}>
					{BUILT_IN_TEMPLATES.map((template) => (
						<SelectionCard
							key={template.id}
							selected={selectedTemplateId === template.id}
							onClick={() => handleApplyTemplate(template)}
							title={template.name}
							description={template.description}
							icon={
								<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							}
						/>
					))}
				</GridList>
			</div>

			{/* User Templates */}
			{userTemplates.filter((t: Template) => !t.isBuiltIn).length > 0 && (
				<div className="grid gap-2">
					<p className="text-xs text-muted-foreground uppercase tracking-wide">
						Custom
					</p>
					<GridList columns={{ mobile: 1, sm: 2 }} gap={2}>
						{userTemplates
							.filter((t: Template) => !t.isBuiltIn)
							.map((template: Template) => (
								<SelectionCard
									key={template.id}
									selected={selectedTemplateId === template.id}
									onClick={() => handleApplyTemplate(template)}
									title={template.name}
									description={template.description}
									icon={
										<BookTemplate className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
									}
									action={
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteTemplate(template.id);
											}}
											className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
											aria-label="Delete template"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									}
								/>
							))}
					</GridList>
				</div>
			)}
		</div>
	);
}
