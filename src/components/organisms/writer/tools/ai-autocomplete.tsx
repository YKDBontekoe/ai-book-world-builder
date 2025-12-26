"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useDebounceValue } from "usehooks-ts";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

interface AutocompleteSuggestion {
	text: string;
	reason: string;
}

export function AIAutocomplete({
	onSelect,
	onDismiss,
}: {
	onSelect: (text: string) => void;
	onDismiss: () => void;
}) {
	const { project, sceneContent, activeSceneId } = useWriterContext();
	const [debouncedContent] = useDebounceValue(sceneContent || "", 1500);
	const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!activeSceneId || !debouncedContent || debouncedContent.length < 100) {
			setSuggestions([]);
			return;
		}

		// Only show autocomplete if user is at the end of content (likely typing)
		const shouldShow = debouncedContent.trim().length > 0;

		if (!shouldShow) {
			setSuggestions([]);
			return;
		}

		// Generate suggestions based on context
		const generateSuggestions = async () => {
			setIsLoading(true);
			try {
				// Get last few sentences for context
				const sentences = debouncedContent.match(/[^.!?]+[.!?]+/g) || [];
				const recentContext = sentences.slice(-3).join(" ");

				// Call AI to generate continuation suggestions
				const response = await api.post<{ suggestions: AutocompleteSuggestion[] }>(
					"/api/ai-suggestions",
					{
						projectId: project.id,
						messages: [
							{
								role: "user",
								content: `Based on this writing context, suggest 2-3 natural continuations (just the next sentence or phrase, not explanations):\n\n${recentContext}`,
							},
						],
						modelId: "openrouter/anthropic/claude-3.5-sonnet",
					},
				);

				if (response && Array.isArray(response)) {
					// Transform suggestions format
					const transformed = response.slice(0, 3).map((s: any, i: number) => ({
						text: s.prompt || s.label || "",
						reason: s.reasoning || `Suggestion ${i + 1}`,
					}));
					setSuggestions(transformed);
					setSelectedIndex(0);
				}
			} catch (error) {
				console.error("Failed to generate autocomplete:", error);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		};

		const timeoutId = setTimeout(generateSuggestions, 500);
		return () => clearTimeout(timeoutId);
	}, [debouncedContent, activeSceneId, project.id]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (suggestions.length === 0) return;

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % suggestions.length);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
			} else if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				if (suggestions[selectedIndex]) {
					onSelect(suggestions[selectedIndex].text);
					setSuggestions([]);
				}
			} else if (e.key === "Escape") {
				onDismiss();
				setSuggestions([]);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [suggestions, selectedIndex, onSelect, onDismiss]);

	if (suggestions.length === 0 && !isLoading) return null;

	return (
		<AnimatePresence>
			<motion.div
				ref={containerRef}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 10 }}
				transition={{ type: "spring", stiffness: 400, damping: 25 }}
				className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
			>
				<GlassCard
					variant="liquid"
					className="p-3 space-y-2 border-primary/20 shadow-2xl"
				>
					<div className="flex items-center gap-2 mb-2">
						<Sparkles className="h-3.5 w-3.5 text-primary" />
						<span className="text-xs font-bold uppercase text-muted-foreground">
							AI Suggestions
						</span>
						{isLoading && (
							<div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />
						)}
					</div>

					{isLoading ? (
						<div className="text-xs text-muted-foreground py-2">
							Generating suggestions...
						</div>
					) : (
						<div className="space-y-1">
							{suggestions.map((suggestion, index) => (
								<button
									key={index}
									type="button"
									onClick={() => {
										onSelect(suggestion.text);
										setSuggestions([]);
									}}
									className={cn(
										"w-full text-left p-2.5 rounded-lg text-sm transition-all",
										"hover:bg-primary/10 border border-transparent",
										index === selectedIndex &&
											"bg-primary/20 border-primary/30 shadow-sm",
									)}
								>
									<div className="flex items-start gap-2">
										<ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="text-foreground leading-relaxed">
												{suggestion.text}
											</p>
											{suggestion.reason && (
												<p className="text-xs text-muted-foreground mt-1">
													{suggestion.reason}
												</p>
											)}
										</div>
									</div>
								</button>
							))}
						</div>
					)}

					<div className="pt-2 border-t border-white/10 text-[10px] text-muted-foreground text-center">
						Press Enter to accept • Arrow keys to navigate • Esc to dismiss
					</div>
				</GlassCard>
			</motion.div>
		</AnimatePresence>
	);
}

