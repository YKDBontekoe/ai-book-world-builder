import { toast } from "sonner";
import { exportProject } from "@/features/writer/actions/project-export";

export async function exportProjectToClipboard(projectId: string): Promise<void> {
	const toastId = toast.loading("Exporting project...");
	try {
		const result = await exportProject(projectId);

		if (!result.success || !result.content) {
			toast.error(result.error || "Failed to export", { id: toastId });
			return;
		}

		try {
			await navigator.clipboard.writeText(result.content);
			toast.success("Project exported to clipboard", { id: toastId });
		} catch (err) {
			console.warn("navigator.clipboard.writeText failed", err);
			// Fallback
			try {
				const textarea = document.createElement("textarea");
				textarea.value = result.content;
				// Prevent scrolling to bottom of page
				textarea.style.position = "fixed";
				textarea.style.left = "0";
				textarea.style.top = "0";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				const successful = document.execCommand("copy");
				document.body.removeChild(textarea);
				if (successful) {
					toast.success("Project exported to clipboard", { id: toastId });
				} else {
					throw new Error("execCommand failed");
				}
			} catch (fallbackErr) {
				console.error("Clipboard fallback failed", fallbackErr);
				toast.error(
					"Failed to copy to clipboard. Please copy manually or check permissions.",
					{ id: toastId },
				);
			}
		}
	} catch (error) {
		console.error("Export error", error);
		toast.error("Error exporting project", { id: toastId });
	}
}
