"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { PreviewSuggestion } from "@/components/molecules/preview-suggestion";
import type { ActiveSuggestion } from "./hooks/use-suggestions";

interface SuggestionPopupProps {
	activeSuggestion: ActiveSuggestion | null;
	onApply: () => void;
	onReject: () => void;
}

export function SuggestionPopup({
	activeSuggestion,
	onApply,
	onReject,
}: SuggestionPopupProps) {
	if (!activeSuggestion || typeof document === "undefined") return null;

	return createPortal(
		<motion.div
			data-suggestion-popup
			initial={{ opacity: 0, y: -5 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -5 }}
			className="fixed z-[100]"
			style={{
				left: activeSuggestion.coords.left,
				top: activeSuggestion.coords.top,
			}}
		>
			<PreviewSuggestion
				suggestion={activeSuggestion.suggestion}
				onApply={onApply}
				onReject={onReject}
				artifactKind="text"
			/>
		</motion.div>,
		document.body,
	);
}
