import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { generateEntitySummaryAction } from "@/app/actions/ai-operations";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Textarea } from "@/components/atoms/textarea";
import { entityTypeConfig } from "@/components/organisms/book-canvas/panes/bible/types";

const createEntitySchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	kind: z.string().min(1, "Type is required"),
	summary: z.string().max(500, "Summary must be less than 500 characters"),
});

type CreateEntityFormValues = z.infer<typeof createEntitySchema>;

interface CreateEntityDialogProps {
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: CreateEntityFormValues) => Promise<void>;
	isSubmitting: boolean;
}

export function CreateEntityDialog({
	projectId,
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
}: CreateEntityDialogProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const form = useForm<CreateEntityFormValues>({
		resolver: zodResolver(createEntitySchema),
		defaultValues: {
			name: "",
			kind: "character",
			summary: "",
		},
	});

	const handleSubmit = async (values: CreateEntityFormValues) => {
		await onSubmit(values);
		form.reset();
		onOpenChange(false);
	};

	const handleGenerateSummary = async () => {
		const name = form.getValues("name");
		const kind = form.getValues("kind");

		if (!name) {
			toast.error("Please enter a name first");
			form.setFocus("name");
			return;
		}

		setIsGenerating(true);
		try {
			const result = await generateEntitySummaryAction(projectId, name, kind);
			if (result.success && result.summary) {
				form.setValue("summary", result.summary, { shouldDirty: true });
			} else {
				throw new Error(result.error || "Failed to generate summary");
			}
		} catch (error) {
			console.error("Failed to generate summary:", error);
			toast.error("Failed to generate summary");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Entity</DialogTitle>
					<DialogDescription>
						Add a new character, location, or item to your story bible.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g. Gandalf" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="kind"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.entries(entityTypeConfig).map(([key, config]) => (
												<SelectItem key={key} value={key}>
													{config.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="summary"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Summary (Optional)</FormLabel>
										<Button
											type="button"
											variant="ghost"
											size="xs"
											className="h-6 gap-1.5 text-primary"
											onClick={handleGenerateSummary}
											disabled={isGenerating || isSubmitting}
										>
											{isGenerating ? (
												<LoadingSpinner size="xs" />
											) : (
												<Sparkles className="h-3 w-3" />
											)}
											Magic Fill
										</Button>
									</div>
									<FormControl>
										<Textarea
											placeholder="Brief description..."
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Entity"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
