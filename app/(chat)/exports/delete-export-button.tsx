"use client";

import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type DeleteExportButtonProps = {
	exportId: string;
};

export function DeleteExportButton({ exportId }: DeleteExportButtonProps) {
	const router = useRouter();

	const { mutate: handleDelete, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			return api.delete(`/api/exports/${exportId}`);
		},
		onSuccess: () => {
			toast.success("Export deleted");
			router.refresh();
		},
		onError: (error) => {
			console.error("Delete error:", error);
			toast.error("Failed to delete export");
		},
	});

	return (
		<Button
			disabled={isDeleting}
			onClick={() => {
				if (confirm("Are you sure you want to delete this export?")) {
					handleDelete();
				}
			}}
			size="sm"
			variant="ghost"
			aria-label="Delete export"
		>
			<Trash2 className="size-4 text-muted-foreground" />
		</Button>
	);
}
