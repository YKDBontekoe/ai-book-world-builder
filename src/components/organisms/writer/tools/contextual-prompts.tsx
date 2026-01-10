"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";

interface ContextualPrompt {
	id: string;
	text: string;
	action: string;
	type: "suggestion" | "improvement" | "inspiration";
}

export function ContextualPrompts() {
	const { project, sceneContent, activeSceneId } = useWriterContext();
	const { data: entities } = useProjectEntities(project.id);
	const [debouncedContent] = useDebounceValue(sceneContent || "", 2000);
	const [prompts, setPrompts] = useState<ContextualPrompt[]>([]);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (!activeSceneId || !debouncedContent || debouncedContent.length < 50) {
			setPrompts([]);
			setIsVisible(false);
			return;
		}

		// Generate contextual prompts based on content
		const generatePrompts = (): ContextualPrompt[] => {
			const wordCount = debouncedContent.split(/\s+/).length;
			const hasDialogue = /["'"]/.test(debouncedContent);
			const hasAction = /\b(run|jump|grab|throw|strike|attack|defend)\b/i.test(
				debouncedContent,
			);
			const hasDescription = /\b(look|see|feel|smell|taste|sound)\b/i.test(
				debouncedContent,
			);

			const newPrompts: ContextualPrompt[] = [];

			// Word count suggestions
			if (wordCount < 200) {
				newPrompts.push({
					id: "expand",
					text: "This scene is quite short. Consider expanding with more detail.",
					action: "Expand this scene",
					type: "suggestion",
				});
			}

			// Dialogue suggestions
			if (!hasDialogue && wordCount > 300) {
				newPrompts.push({
					id: "dialogue",
					text: "Consider adding dialogue to bring characters to life.",
					action: "Add dialogue",
					type: "suggestion",
				});
			}

			// Action vs description balance
			if (hasAction && !hasDescription) {
				newPrompts.push({
					id: "description",
					text: "Add sensory details to ground the action in the scene.",
					action: "Add description",
					type: "improvement",
				});
			}

			if (hasDescription && !hasAction && wordCount > 400) {
				newPrompts.push({
					id: "action",
					text: "Consider adding movement or action to maintain pacing.",
					action: "Add action",
					type: "improvement",
				});
			}

			// Entity mentions
			const mentionedEntities = entities?.filter((e) =>
				debouncedContent.toLowerCase().includes(e.name.toLowerCase()),
			);
			if (
				mentionedEntities &&
				mentionedEntities.length === 0 &&
				entities &&
				entities.length > 0
			) {
				newPrompts.push({
					id: "entities",
					text: `You have ${entities.length} entities in your world. Consider mentioning them.`,
					action: "Use @ to mention entities",
					type: "inspiration",
				});
			}

			return newPrompts.slice(0, 2); // Limit to 2 prompts
		};

		const newPrompts = generatePrompts();
		setPrompts(newPrompts);
		setIsVisible(newPrompts.length > 0);
	}, [debouncedContent, activeSceneId, entities]);

	if (!isVisible || prompts.length === 0) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				transition={{ type: "spring", stiffness: 400, damping: 25 }}
				className="w-full"
			>
				<GlassCard
					variant="liquid"
					className="p-4 space-y-3 border-primary/20 shadow-2xl"
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="text-xs font-bold uppercase text-muted-foreground">
								Writing Suggestions
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => setIsVisible(false)}
						>
							<X className="h-3 w-3" />
						</Button>
					</div>
					<div className="space-y-2">
						{prompts.map((prompt) => (
							<div
								key={prompt.id}
								className={cn(
									"p-3 rounded-lg text-sm border transition-colors",
									prompt.type === "suggestion" &&
										"bg-blue-500/10 border-blue-500/20 text-blue-300",
									prompt.type === "improvement" &&
										"bg-orange-500/10 border-orange-500/20 text-orange-300",
									prompt.type === "inspiration" &&
										"bg-purple-500/10 border-purple-500/20 text-purple-300",
								)}
							>
								<p className="mb-1">{prompt.text}</p>
								<button
									type="button"
									className="text-xs font-medium underline hover:no-underline"
									onClick={() => {
										// Could trigger an action here
										setIsVisible(false);
									}}
								>
									{prompt.action}
								</button>
							</div>
						))}
					</div>
				</GlassCard>
			</motion.div>
		</AnimatePresence>
	);
}
