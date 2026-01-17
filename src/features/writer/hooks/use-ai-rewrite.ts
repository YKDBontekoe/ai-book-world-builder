import type { EditorView } from "prosemirror-view";
import { useState } from "react";
import { toast } from "sonner";
import { rewriteSelection } from "@/features/writer/actions/ai";

interface UseAiRewriteReturn {
	loading: boolean;
	rewrittenText: string | null;
	handleRewrite: (style: string) => Promise<void>;
	applyRewrite: (onSuccess?: () => void) => void;
	cancelRewrite: () => void;
}

export function useAiRewrite(editorView: EditorView | null): UseAiRewriteReturn {
	const [loading, setLoading] = useState(false);
	const [rewrittenText, setRewrittenText] = useState<string | null>(null);

	const handleRewrite = async (style: string) => {
		if (!editorView) return;
		setLoading(true);

		try {
			const { from, to } = editorView.state.selection;
			const text = editorView.state.doc.textBetween(from, to);

			const result = await rewriteSelection({
				selection: text,
				instruction: `Rewrite this to be more ${style}`,
			});

			if (result.success && result.data.text) {
				setRewrittenText(result.data.text);
			} else {
				toast.error(
					result.success
						? "Rewrite failed"
						: result.error || "An error occurred",
				);
			}
		} catch (error) {
			console.error("AI Rewrite error:", error);
			toast.error(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		} finally {
			setLoading(false);
		}
	};

	const applyRewrite = (onSuccess?: () => void) => {
		if (!editorView || !rewrittenText) return;
		const { from, to } = editorView.state.selection;

		editorView.dispatch(
			editorView.state.tr.replaceWith(
				from,
				to,
				editorView.state.schema.text(rewrittenText),
			),
		);
		setRewrittenText(null);
		onSuccess?.();
	};

	const cancelRewrite = () => {
		setRewrittenText(null);
	};

	return {
		loading,
		rewrittenText,
		handleRewrite,
		applyRewrite,
		cancelRewrite,
	};
}
