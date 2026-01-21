"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import type { z } from "zod";
import { generateEntitySummaryAction } from "@/app/actions/ai-operations";
import { createEntityAction } from "@/app/actions/entities";
import { createEntitySchema } from "@/app/actions/entities-schemas";
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
import { entityTypeConfig } from "@/components/organisms/book-canvas/panes/bible/types";

// Schema for the form
const formSchema = createEntitySchema.pick({
	name: true,
	kind: true,
	summary: true,
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEntityDialogProps {
	projectId: string;
	defaultType?: string;
	trigger?: React.ReactNode;
	onOpenChange?: (open: boolean) => void;
}

export function CreateEntityDialog({
	projectId,
	defaultType = "character",
	trigger,
	onOpenChange,
}: CreateEntityDialogProps) {
	const [open, setOpen] = useState(false);
	const [isMagicFilling, setIsMagicFilling] = useState(false);
	const [lastUsedType, setLastUsedType] = useLocalStorage<string>(
		"create-entity-last-type",
		defaultType,
	);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		getValues,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			kind: defaultType,
			summary: "",
		},
	});

	const nameValue = watch("name");

	// Reset form when dialog opens/closes
	useEffect(() => {
		if (open && isMounted) {
			reset({
				name: "",
				kind: lastUsedType || defaultType,
				summary: "",
			});
		}
	}, [open, defaultType, reset, lastUsedType, isMounted]);

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		onOpenChange?.(newOpen);
	};

	async function onMagicFill() {
		const name = getValues("name");
		const kind = getValues("kind");

		if (!name) {
			toast.error("Please enter a name first");
			return;
		}

		setIsMagicFilling(true);
		const toastId = toast.loading("Magically filling details...");

		try {
			const result = await generateEntitySummaryAction(projectId, name, kind);

			if (result.success && result.data) {
				setValue("summary", result.data.summary || "");
				toast.success("Magic Fill complete!", { id: toastId });
			} else {
				toast.error(result.error || "Failed to generate details", {
					id: toastId,
				});
			}
		} catch (error) {
			toast.error("Magic Fill failed", { id: toastId });
		} finally {
			setIsMagicFilling(false);
		}
	}

	async function onSubmit(values: FormValues) {
		const toastId = toast.loading("Creating entity...");

		try {
			await createEntityAction({
				projectId,
				...values,
			});

			setLastUsedType(values.kind);
			toast.success("Entity created successfully", { id: toastId });
			handleOpenChange(false);
		} catch (error) {
			toast.error("Failed to create entity", { id: toastId });
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Entity
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Entity</DialogTitle>
					<DialogDescription>
						Add a new character, location, or item to your Story Bible.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="kind">Type</Label>
						<Controller
							control={control}
							name="kind"
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger id="kind">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(entityTypeConfig).map(([key, config]) => (
											<SelectItem key={key} value={key}>
												{config.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.kind && (
							<p className="text-xs text-destructive">{errors.kind.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<div className="flex gap-2">
							<Input
								id="name"
								placeholder="e.g. Gandalf"
								{...register("name")}
							/>
							<Button
								type="button"
								size="icon"
								variant="outline"
								onClick={onMagicFill}
								disabled={isMagicFilling || !nameValue}
								title="Magic Fill details"
							>
								{isMagicFilling ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Sparkles className="h-4 w-4 text-primary" />
								)}
							</Button>
						</div>
						{errors.name && (
							<p className="text-xs text-destructive">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="summary">Summary</Label>
						<Textarea
							id="summary"
							placeholder="Brief description..."
							className="h-24 resize-none"
							{...register("summary")}
						/>
						{errors.summary && (
							<p className="text-xs text-destructive">
								{errors.summary.message}
							</p>
						)}
					</div>

					<DialogFooter>
						<Button type="submit" disabled={isSubmitting || isMagicFilling}>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Create Entity
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
