"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type DeleteExportButtonProps = {
	exportId: string;
};

export function DeleteExportButton({ exportId }: DeleteExportButtonProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this export?")) {
			return;
		}

		setIsDeleting(true);

		try {
			const response = await fetch(`/api/exports/${exportId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete export");
			}

			toast.success("Export deleted");
			router.refresh();
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Failed to delete export");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Button
			disabled={isDeleting}
			onClick={handleDelete}
			size="sm"
			variant="ghost"
		>
			<Trash2 className="size-4 text-muted-foreground" />
		</Button>
	);
}
