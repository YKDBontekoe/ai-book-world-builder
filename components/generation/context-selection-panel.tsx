"use client";

import {
	BookOpen,
	Check,
	ChevronDown,
	ChevronRight,
	FileText,
	Layers,
	Search,
	Sparkles,
	Users,
	Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import type { ContextSelection } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface ContextSelectionPanelProps {
	projectId: string;
	value?: ContextSelection;
	onChange?: (selection: ContextSelection) => void;
}

type ContextGroup = {
	id: keyof ContextSelection;
	label: string;
	icon: React.ReactNode;
	items: Array<{ id: string; name: string; kind?: string; included: boolean }>;
};

type ProjectContextResponse = {
	entities: Array<{ id: string; name: string; kind?: string }>;
	outlines: Array<{ id: string; title: string }>;
	scenes: Array<{ id: string; title: string; chapterId?: string }>;
	drafts: Array<{ id: string; chapterTitle: string }>;
	sourceMaterials: Array<{ id: string; filename: string }>;
};

async function fetchProjectContext(
	projectId: string,
): Promise<ProjectContextResponse> {
	const res = await fetch(`/api/projects/${projectId}/context`);
	if (!res.ok) throw new Error("Failed to fetch context");
	return res.json();
}

export function ContextSelectionPanel({
	projectId,
	onChange,
}: ContextSelectionPanelProps) {
	const { data, isLoading } = useSWR(
		["project-context", projectId],
		() => fetchProjectContext(projectId),
	);

	const [selection, setSelection] = useState<ContextSelection>({
		entities: [],
		outlines: [],
		scenes: [],
		drafts: [],
		sourceMaterials: [],
	});

	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
		new Set(["entities", "outlines"]),
	);

	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (data) {
			const newSelection: ContextSelection = {
				entities:
					data.entities?.map((e) => ({
						id: e.id,
						name: e.name,
						kind: e.kind || "other",
						included: true,
					})) || [],
				outlines:
					data.outlines?.map((o) => ({
						id: o.id,
						title: o.title,
						included: true,
					})) || [],
				scenes:
					data.scenes?.map((s) => ({
						id: s.id,
						title: s.title,
						chapterId: s.chapterId || "",
						included: true,
					})) || [],
				drafts:
					data.drafts?.map((d) => ({
						id: d.id,
						chapterTitle: d.chapterTitle,
						included: true,
					})) || [],
				sourceMaterials:
					data.sourceMaterials?.map((m) => ({
						id: m.id,
						filename: m.filename,
						included: false,
					})) || [],
			};
			setSelection(newSelection);
			onChange?.(newSelection);
		}
	}, [data, onChange]);

	const updateSelection = (newSelection: ContextSelection) => {
		setSelection(newSelection);
		onChange?.(newSelection);
	};

	const groups: ContextGroup[] = [
		{
			id: "entities",
			label: "Characters & Entities",
			icon: <Users className="h-4 w-4" />,
			items: selection.entities.map((e) => ({
				id: e.id,
				name: e.name,
				kind: e.kind,
				included: e.included,
			})),
		},
		{
			id: "outlines",
			label: "Outlines & Plot",
			icon: <Layers className="h-4 w-4" />,
			items: selection.outlines.map((o) => ({
				id: o.id,
				name: o.title,
				included: o.included,
			})),
		},
		{
			id: "scenes",
			label: "Scenes",
			icon: <Sparkles className="h-4 w-4" />,
			items: selection.scenes.map((s) => ({
				id: s.id,
				name: s.title,
				included: s.included,
			})),
		},
		{
			id: "drafts",
			label: "Existing Drafts",
			icon: <FileText className="h-4 w-4" />,
			items: selection.drafts.map((d) => ({
				id: d.id,
				name: d.chapterTitle,
				included: d.included,
			})),
		},
		{
			id: "sourceMaterials",
			label: "Source Materials",
			icon: <BookOpen className="h-4 w-4" />,
			items: selection.sourceMaterials.map((m) => ({
				id: m.id,
				name: m.filename,
				included: m.included,
			})),
		},
	];

	const toggleGroup = (groupId: string) => {
		setExpandedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(groupId)) {
				next.delete(groupId);
			} else {
				next.add(groupId);
			}
			return next;
		});
	};

	const toggleItem = (groupId: keyof ContextSelection, itemId: string) => {
		// Use a specific type assertion to help TS understand the structure
		const group = selection[groupId] as Array<
			{ id: string; included: boolean } & Record<string, unknown>
		>;
		const updated = group.map((item) =>
			item.id === itemId ? { ...item, included: !item.included } : item,
		);
		// Cast updated back to any to satisfy the complex ContextSelection types
		updateSelection({ ...selection, [groupId]: updated as any });
	};

	const toggleAll = (groupId: keyof ContextSelection, included: boolean) => {
		const group = selection[groupId] as Array<
			{ id: string; included: boolean } & Record<string, unknown>
		>;
		const updated = group.map((item) => ({ ...item, included }));
		updateSelection({ ...selection, [groupId]: updated as any });
	};

	const selectAllEssential = () => {
		updateSelection({
			...selection,
			entities: selection.entities.map((e) => ({ ...e, included: true })),
			outlines: selection.outlines.map((o) => ({ ...o, included: true })),
			scenes: selection.scenes.map((s) => ({ ...s, included: true })),
			drafts: selection.drafts.map((d) => ({ ...d, included: true })),
			sourceMaterials: selection.sourceMaterials.map((m) => ({
				...m,
				included: false,
			})),
		});
	};

	const selectAllItems = () => {
		updateSelection({
			entities: selection.entities.map((e) => ({ ...e, included: true })),
			outlines: selection.outlines.map((o) => ({ ...o, included: true })),
			scenes: selection.scenes.map((s) => ({ ...s, included: true })),
			drafts: selection.drafts.map((d) => ({ ...d, included: true })),
			sourceMaterials: selection.sourceMaterials.map((m) => ({
				...m,
				included: true,
			})),
		});
	};

	const getSelectedCount = (items: Array<{ included: boolean }>) =>
		items.filter((i) => i.included).length;

	const totalSelected = groups.reduce(
		(acc, group) => acc + getSelectedCount(group.items),
		0,
	);

	const totalItems = groups.reduce((acc, group) => acc + group.items.length, 0);

	const filterItems = (items: ContextGroup["items"]) => {
		if (!searchQuery) return items;
		return items.filter((item) =>
			item.name.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-48 rounded-xl bg-muted" />
					<div className="space-y-2">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-12 rounded-xl bg-muted" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header - Glassmorphic */}
			<GlassCard padding="lg" rounded="2xl">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<BookOpen className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h2 className="text-xl font-bold">Context Selection</h2>
						<p className="text-sm text-muted-foreground">
							Select project data for AI generation
						</p>
					</div>
				</div>
			</GlassCard>

			{/* Quick Actions - Glassmorphic */}
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={selectAllEssential}
					className="gap-1.5 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm"
				>
					<Wand2 className="h-3.5 w-3.5" />
					Essential Only
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={selectAllItems}
					className="gap-1.5 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm"
				>
					<Check className="h-3.5 w-3.5" />
					Select All
				</Button>
				<div className="flex-1" />
				<div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary backdrop-blur-sm">
					<Check className="h-3.5 w-3.5" />
					<span className="text-sm font-medium">
						{totalSelected}/{totalItems} selected
					</span>
				</div>
			</div>

			{/* Search - Glassmorphic */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search items..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="rounded-xl border-border/50 bg-background/50 pl-9 backdrop-blur-sm"
				/>
			</div>

			{/* Groups - Glassmorphic */}
			<div className="space-y-3">
				{groups.map((group) => {
					const isExpanded = expandedGroups.has(group.id);
					const filteredItems = filterItems(group.items);
					const selectedCount = getSelectedCount(group.items);
					const allSelected = selectedCount === group.items.length;

					if (group.items.length === 0) return null;

					return (
						<GlassCard
							key={group.id}
							padding="none"
							rounded="xl"
							className="overflow-hidden"
						>
							{/* Group Header */}
							{/* biome-ignore lint/a11y/useSemanticElements: Nested interactive elements require div */}
							<div
								role="button"
								tabIndex={0}
								className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-muted/30"
								onClick={() => toggleGroup(group.id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										toggleGroup(group.id);
									}
								}}
							>
								<div className="flex items-center gap-3">
									{isExpanded ? (
										<ChevronDown className="h-4 w-4 text-muted-foreground" />
									) : (
										<ChevronRight className="h-4 w-4 text-muted-foreground" />
									)}
									<div className="flex items-center gap-2">
										<span className="text-primary">{group.icon}</span>
										<span className="font-medium">{group.label}</span>
									</div>
									<span
										className={cn(
											"rounded-full px-2 py-0.5 text-xs",
											allSelected
												? "bg-primary/10 text-primary"
												: "bg-muted text-muted-foreground",
										)}
									>
										{selectedCount}/{group.items.length}
									</span>
								</div>

								<Button
									variant="ghost"
									size="sm"
									className="rounded-lg"
									onClick={(e) => {
										e.stopPropagation();
										toggleAll(group.id, !allSelected);
									}}
								>
									{allSelected ? "Deselect All" : "Select All"}
								</Button>
							</div>

							{/* Group Items */}
							{isExpanded && filteredItems.length > 0 && (
								<div className="border-t border-border/50 bg-muted/20 p-2">
									<div className="max-h-48 space-y-1 overflow-y-auto">
										{filteredItems.map((item) => (
											<div
												key={item.id}
												// biome-ignore lint/a11y/useSemanticElements: Checkbox inside requires div
												role="button"
												tabIndex={0}
												className={cn(
													"flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
													item.included
														? "bg-primary/5 hover:bg-primary/10"
														: "hover:bg-muted/50",
												)}
												onClick={(e) => {
													if ((e.target as HTMLElement).closest("button"))
														return;
													toggleItem(group.id, item.id);
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														toggleItem(group.id, item.id);
													}
												}}
											>
												<Checkbox
													checked={item.included}
													onCheckedChange={() => toggleItem(group.id, item.id)}
												/>
												<span
													className={cn(
														"flex-1 text-sm",
														!item.included && "text-muted-foreground",
													)}
												>
													{item.name}
												</span>
												{item.kind && (
													<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
														{item.kind}
													</span>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{isExpanded && filteredItems.length === 0 && searchQuery && (
								<div className="border-t border-border/50 p-4 text-center text-sm text-muted-foreground">
									No items match "{searchQuery}"
								</div>
							)}
						</GlassCard>
					);
				})}
			</div>
		</div>
	);
}
