"use client";

import {
	BookOpen,
	Calendar,
	Loader2,
	MapPin,
	Package,
	Pencil,
	User,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { toast } from "sonner";
import { updateEntityAction } from "@/app/actions/entities";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { InteractiveWidget } from "@/components/organisms/chat/widgets/interactive-widget";
import { cn } from "@/lib/utils";

export interface EntityWidgetProps {
	entity: {
		id: string;
		name: string;
		kind: string;
		summary?: string | null;
		startDate?: string | null;
		endDate?: string | null;
		attributes?: Array<{ name: string; value: string }>;
		relationships?: Array<{ type: string; targetEntityId: string }>;
		projectId?: string;
	};
	projectId?: string;
}

const entityIcons = {
	character: User,
	location: MapPin,
	item: Package,
	organization: Users,
	event: Calendar,
	other: BookOpen,
};

const entityColors = {
	character:
		"text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/40",
	location:
		"text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40",
	item: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40",
	organization:
		"text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40",
	event:
		"text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40",
	other: "text-zinc-700 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800/40",
};

export function EntityWidget({ entity, projectId }: EntityWidgetProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Edit state
	const [name, setName] = useState(entity.name);
	const [kind, setKind] = useState(entity.kind);
	const [summary, setSummary] = useState(entity.summary ?? "");
	const [attributes, setAttributes] = useState(entity.attributes ?? []);

	const Icon = entityIcons[entity.kind as keyof typeof entityIcons] || BookOpen;
	const colorClass =
		entityColors[entity.kind as keyof typeof entityColors] ||
		entityColors.other;

	const handleSave = async () => {
		if (!projectId && !entity.projectId) return;

		setIsSaving(true);
		try {
			await updateEntityAction({
				id: entity.id,
				projectId: projectId ?? entity.projectId!,
				name,
				kind,
				summary,
				attributes,
			});
			setIsEditing(false);
			toast.success("Entity updated");
		} catch (error) {
			toast.error("Failed to update entity");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleAuditAttribute = (index: number, key: string, value: string) => {
		const newAttributes = [...attributes];
		newAttributes[index] = { ...newAttributes[index], [key]: value };
		setAttributes(newAttributes);
	};

	const handleAddAttribute = () => {
		setAttributes([...attributes, { name: "", value: "" }]);
	};

	const handleRemoveAttribute = (index: number) => {
		setAttributes(attributes.filter((_, i) => i !== index));
	};

	const idPrefix = useId();

	if (isEditing) {
		return (
			<InteractiveWidget
				isEditing={true}
				headerIcon={<Icon size={16} />}
				headerTitle="Edit Entity"
				headerColor={colorClass.replace("bg-", "bg- bg-opacity-20")}
			>
				<div className="flex flex-col gap-4 p-4">
					<div className="space-y-1">
						<Label htmlFor={`${idPrefix}-name`} className="text-xs">
							Name
						</Label>
						<Input
							id={`${idPrefix}-name`}
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-8 text-sm"
						/>
					</div>

					<div className="space-y-1">
						<Label htmlFor={`${idPrefix}-kind`} className="text-xs">
							Kind
						</Label>
						<Input
							id={`${idPrefix}-kind`}
							value={kind}
							onChange={(e) => setKind(e.target.value)}
							className="h-8 text-sm"
						/>
					</div>

					<div className="space-y-1">
						<Label htmlFor={`${idPrefix}-summary`} className="text-xs">
							Summary
						</Label>
						<Textarea
							id={`${idPrefix}-summary`}
							value={summary}
							onChange={(e) => setSummary(e.target.value)}
							className="min-h-[80px] text-sm resize-none"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label className="text-xs">Attributes</Label>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleAddAttribute}
								className="h-6 text-[10px]"
							>
								+ Add
							</Button>
						</div>
						{attributes.map((attr, i) => (
							<div key={i} className="flex items-start gap-2">
								<Input
									value={attr.name}
									onChange={(e) =>
										handleAuditAttribute(i, "name", e.target.value)
									}
									placeholder="Name"
									className="h-7 text-xs flex-1"
								/>
								<Input
									value={attr.value}
									onChange={(e) =>
										handleAuditAttribute(i, "value", e.target.value)
									}
									placeholder="Value"
									className="h-7 text-xs flex-1"
								/>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-muted-foreground hover:text-destructive"
									onClick={() => handleRemoveAttribute(i)}
								>
									<X size={12} />
								</Button>
							</div>
						))}
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
							Save
						</Button>
					</div>
				</div>
			</InteractiveWidget>
		);
	}

	const hasAttributes = entity.attributes && entity.attributes.length > 0;

	return (
		<InteractiveWidget
			headerIcon={<Icon size={16} />}
			headerTitle={entity.name}
			headerSubtitle={entity.kind}
			headerColor={colorClass.replace("bg-", "bg- bg-opacity-20")}
		>
			<div className="group/content flex flex-col gap-3 px-4 pt-2 pb-4">
				{entity.summary && (
					<div className="text-muted-foreground text-sm leading-relaxed">
						{entity.summary}
					</div>
				)}

				{/* Dates */}
				{(entity.startDate || entity.endDate) && (
					<div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
						{entity.startDate && (
							<span className="flex items-center gap-1 opacity-80">
								<Calendar size={10} className="opacity-50" />
								{new Date(entity.startDate).toLocaleDateString()}
							</span>
						)}
						{entity.endDate && (
							<span className="flex items-center gap-1 opacity-80">
								<span>→</span>
								{new Date(entity.endDate).toLocaleDateString()}
							</span>
						)}
					</div>
				)}

				{/* Attributes */}
				{hasAttributes && (
					<div className="flex flex-wrap gap-2 mt-1">
						{entity.attributes?.slice(0, 6).map((attr, i) => (
							<div
								key={i}
								className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 text-xs transition-colors hover:bg-secondary"
							>
								<span className="text-[10px] uppercase text-muted-foreground/70 font-semibold tracking-wide">
									{attr.name}
								</span>
								<span className="w-[1px] h-3 bg-border/50" />
								<span className="font-medium text-foreground/90">
									{attr.value}
								</span>
							</div>
						))}
						{(entity.attributes?.length || 0) > 6 && (
							<div className="text-[10px] text-muted-foreground self-center px-1">
								+{entity.attributes!.length - 6} more
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center justify-between border-t border-border/40 px-4 py-2 bg-muted/5 mt-auto">
				{projectId || entity.projectId ? (
					<Link
						className="text-primary/80 text-xs hover:underline hover:text-primary transition-colors flex items-center gap-1"
						href={`/projects/${projectId || entity.projectId}/entities/${entity.id}`}
					>
						<span>Details</span>
						<span className="text-[10px]">→</span>
					</Link>
				) : (
					<span />
				)}

				<Button
					variant="ghost"
					size="sm"
					className="h-6 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
					onClick={() => setIsEditing(true)}
				>
					<Pencil size={10} />
					Edit
				</Button>
			</div>
		</InteractiveWidget>
	);
}
