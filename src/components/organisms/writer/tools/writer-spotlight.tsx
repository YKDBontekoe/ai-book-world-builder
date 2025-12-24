"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	BookPlus,
	FileText,
	MessageSquare,
	SearchIcon,
	Sparkles,
	Target,
	User,
	UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { createNewChapter } from "@/app/actions/writer";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";

type Category = "all" | "actions" | "entities" | "scenes" | "create";

interface SpotlightItem {
	id: string;
	label: string;
	subLabel?: string;
	icon: React.ElementType;
	type: Category | "action";
	category: Category;
	keywords?: string[];
	onSelect: () => void;
}

export function WriterSpotlight() {
	const { isSpotlightOpen, toggleSpotlight, setChatOpen } = useWriterControl();
	const { project, structure, setActiveSceneId } = useWriterContext();
	const { toggleZenMode, toggleTypewriterMode } = useWriterLayoutContext();
	const { data: entities } = useProjectEntities(project.id);

	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounceValue(query, 150);
	const [activeCategory, setActiveCategory] = useState<Category>("all");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	// Helper for icons - Memoized to be stable for useMemo deps
	const MapPinIcon = useCallback(
		({ className }: { className?: string }) => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
			>
				<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
				<circle cx="12" cy="10" r="3" />
			</svg>
		),
		[],
	);

	// Reset state on open
	useEffect(() => {
		if (isSpotlightOpen) {
			setTimeout(() => inputRef.current?.focus(), 50);
			setQuery("");
			setSelectedIndex(0);
			setActiveCategory("all");
		}
	}, [isSpotlightOpen]);

	// Reset selection when list changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset index on filter change
	useEffect(() => {
		setSelectedIndex(0);
	}, [activeCategory, debouncedQuery]);

	// Build Items
	const items = useMemo<SpotlightItem[]>(() => {
		const list: SpotlightItem[] = [];

		// 0. Creation (Power User Features)
		list.push(
			{
				id: "create-chapter",
				label: "Create New Chapter",
				subLabel: "Append a new chapter to the end of the book",
				icon: BookPlus,
				type: "create",
				category: "create",
				keywords: ["new", "add", "chapter"],
				onSelect: async () => {
					const toastId = toast.loading("Creating chapter...");
					try {
						await createNewChapter(project.id);
						toast.success("Chapter created", { id: toastId });
						// We need to trigger a structure refresh here if possible,
						// but WriterContext handles it via optimistic updates or we might need to force it.
						// Currently relying on the user seeing the update or manual refresh if context doesn't auto-update.
						// The context doesn't expose a 'refresh' method directly in the hook return type used here,
						// but we can assume the server action + revalidatePath will handle it or the user will see it.
						window.location.reload(); // Force reload to see changes as context doesn't expose refresh
					} catch (_e) {
						toast.error("Failed to create chapter", { id: toastId });
					}
					toggleSpotlight();
				},
			},
			{
				id: "create-entity",
				label: "Create New Character",
				subLabel: "Quickly add a new character to the database",
				icon: UserPlus,
				type: "create",
				category: "create",
				keywords: ["new", "add", "character", "entity", "person"],
				onSelect: () => {
					// Open the chat with a specific intent or navigate to entity creator
					// For now, let's open chat with a prompt
					setChatOpen(true);
					// Ideally we would pre-fill the chat input, but we can't easily do that yet.
					// So we'll just open chat.
					toast.info("Ask the AI to create a new character for you.");
					toggleSpotlight();
				},
			},
		);

		// 1. Actions
		list.push(
			{
				id: "act-chat",
				label: "Ask AI Assistant",
				subLabel: "Open chat with current context",
				icon: MessageSquare,
				type: "action",
				category: "actions",
				onSelect: () => {
					setChatOpen(true);
					toggleSpotlight();
				},
			},
			{
				id: "act-zen",
				label: "Toggle Zen Mode",
				subLabel: "Focus on writing",
				icon: Target,
				type: "action",
				category: "actions",
				onSelect: () => {
					toggleZenMode();
					toggleSpotlight();
				},
			},
			{
				id: "act-typewriter",
				label: "Toggle Typewriter Mode",
				subLabel: "Keep cursor centered",
				icon: FileText,
				type: "action",
				category: "actions",
				onSelect: () => {
					toggleTypewriterMode();
					toggleSpotlight();
				},
			},
		);

		// 2. Entities
		if (entities) {
			for (const entity of entities) {
				const entityType = entity.kind || "Unknown"; // Fix: use 'kind' not 'type' if 'type' is missing in Entity type, assuming Entity has kind
				const attributes = entity.attributes || [];
				list.push({
					id: `ent-${entity.id}`,
					label: entity.name,
					subLabel: `${entityType} • ${attributes.length} attributes`,
					icon: entityType === "Character" ? User : MapPinIcon,
					type: "entities",
					category: "entities",
					keywords: [entityType, ...attributes.map((a) => a.value)],
					onSelect: () => {
						// For now, open chat with context about this entity
						// Ideally: Insert into text or Show Card
						setChatOpen(true);
						// We need a way to pass initial prompt or context
						toggleSpotlight();
					},
				});
			}
		}

		// 3. Scenes
		if (structure) {
			for (const chapter of structure) {
				const chapterLabel = `Chapter ${chapter.title || "Untitled"}`;

				for (const scene of chapter.scenes) {
					list.push({
						id: `scn-${scene.id}`,
						label: scene.title || "Untitled Scene",
						subLabel: chapterLabel,
						icon: BookOpen,
						type: "scenes",
						category: "scenes",
						onSelect: () => {
							setActiveSceneId(scene.id);
							toggleSpotlight();
						},
					});
				}
			}
		}

		return list;
	}, [
		entities,
		structure,
		project.id,
		setChatOpen,
		toggleSpotlight,
		toggleZenMode,
		toggleTypewriterMode,
		setActiveSceneId,
		MapPinIcon,
	]);

	// Filter
	const filteredItems = useMemo(() => {
		let result = items;

		if (activeCategory !== "all") {
			result = result.filter((i) => i.category === activeCategory);
		}

		if (debouncedQuery.trim()) {
			const q = debouncedQuery.toLowerCase();
			result = result.filter(
				(i) =>
					i.label.toLowerCase().includes(q) ||
					i.subLabel?.toLowerCase().includes(q) ||
					i.keywords?.some((k) => k.toLowerCase().includes(q)),
			);
		}

		return result.slice(0, 50); // Limit results
	}, [items, activeCategory, debouncedQuery]);

	// Keyboard Navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) =>
				prev < filteredItems.length - 1 ? prev + 1 : prev,
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (filteredItems[selectedIndex]) {
				filteredItems[selectedIndex].onSelect();
			}
		} else if (e.key === "Tab") {
			e.preventDefault();
			// Cycle categories
			const categories: Category[] = ["all", "actions", "entities", "scenes"];
			const next =
				categories[
					(categories.indexOf(activeCategory) + 1) % categories.length
				];
			setActiveCategory(next);
		}
	};

	return (
		<Dialog open={isSpotlightOpen} onOpenChange={toggleSpotlight}>
			<DialogContent
				className="max-w-2xl p-0 gap-0 overflow-hidden bg-transparent border-none shadow-none"
				hideCloseButton
			>
				<GlassCard
					variant="liquid"
					className="flex flex-col overflow-hidden rounded-2xl border-white/20 shadow-2xl backdrop-blur-3xl"
				>
					{/* Search Header */}
					<div className="flex flex-col border-b border-white/10 bg-white/5">
						<div className="flex items-center gap-3 px-4 py-4">
							<SearchIcon className="w-5 h-5 text-primary animate-pulse" />
							<input
								ref={inputRef}
								aria-label="Search commands"
								className="flex-1 bg-transparent border-none outline-none text-xl placeholder:text-muted-foreground/50 text-foreground font-light tracking-wide"
								placeholder="What do you need?"
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
									setSelectedIndex(0);
								}}
								onKeyDown={handleKeyDown}
							/>
							<div className="flex items-center gap-2">
								<kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 rounded bg-white/10 text-[10px] font-medium text-muted-foreground font-mono">
									ESC
								</kbd>
							</div>
						</div>

						{/* Categories */}
						<div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
							{(
								["all", "create", "actions", "entities", "scenes"] as const
							).map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setActiveCategory(cat)}
									className={cn(
										"px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 capitalize whitespace-nowrap",
										activeCategory === cat
											? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(124,58,237,0.3)]"
											: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
									)}
								>
									{cat}
								</button>
							))}
						</div>
					</div>

					{/* Results List */}
					<div className="h-[400px] flex">
						<div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
							{filteredItems.length > 0 ? (
								filteredItems.map((item, i) => (
									<motion.button
										type="button"
										key={item.id}
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: i * 0.02,
											type: "spring",
											stiffness: 500,
											damping: 30,
										}}
										className={cn(
											"w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden",
											i === selectedIndex
												? "bg-primary/10"
												: "hover:bg-white/5",
										)}
										onClick={() => item.onSelect()}
										onMouseEnter={() => setSelectedIndex(i)}
									>
										{/* Active Indicator */}
										{i === selectedIndex && (
											<motion.div
												layoutId="active-indicator"
												className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
											/>
										)}

										<div
											className={cn(
												"p-2 rounded-lg transition-colors duration-300",
												i === selectedIndex
													? "bg-primary text-white shadow-lg"
													: "bg-white/5 text-muted-foreground group-hover:text-primary",
											)}
										>
											<item.icon className="w-4 h-4" />
										</div>
										<div className="flex-1 min-w-0">
											<div
												className={cn(
													"font-medium text-sm truncate transition-colors",
													i === selectedIndex
														? "text-primary-foreground"
														: "text-foreground",
												)}
											>
												{item.label}
											</div>
											{item.subLabel && (
												<div className="text-xs text-muted-foreground truncate">
													{item.subLabel}
												</div>
											)}
										</div>
										<ArrowRight
											className={cn(
												"w-4 h-4 transition-all duration-300",
												i === selectedIndex
													? "opacity-100 translate-x-0 text-primary"
													: "opacity-0 -translate-x-2",
											)}
										/>
									</motion.button>
								))
							) : (
								<div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
									<Sparkles className="w-8 h-8 mb-2" />
									<p className="text-sm">No results found</p>
								</div>
							)}
						</div>

						{/* Preview Panel (Hidden on mobile, visible if item selected) */}
						<AnimatePresence mode="wait">
							{filteredItems[selectedIndex] && (
								<motion.div
									key={filteredItems[selectedIndex].id}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									transition={{ duration: 0.2 }}
									className="hidden md:flex w-[280px] border-l border-white/10 bg-white/5 p-6 flex-col gap-4"
								>
									<div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary mb-2 shadow-inner">
										{(() => {
											const Icon = filteredItems[selectedIndex].icon;
											return <Icon className="w-8 h-8" />;
										})()}
									</div>
									<div>
										<h3 className="text-lg font-semibold leading-tight">
											{filteredItems[selectedIndex].label}
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											{filteredItems[selectedIndex].type.toUpperCase()}
										</p>
									</div>

									<div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

									<div className="text-sm text-muted-foreground/80 leading-relaxed">
										{filteredItems[selectedIndex].subLabel}
									</div>

									<div className="mt-auto">
										<div className="flex items-center justify-between text-[10px] text-muted-foreground bg-black/20 rounded-lg p-2">
											<span>Press Enter to select</span>
											<kbd className="font-mono bg-white/10 px-1 rounded">
												↵
											</kbd>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Footer */}
					<div className="bg-white/5 px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-muted-foreground backdrop-blur-xl">
						<div className="flex gap-4">
							<span className="flex items-center gap-1">
								<kbd className="bg-white/10 px-1.5 rounded font-mono">↑↓</kbd>{" "}
								Navigate
							</span>
							<span className="flex items-center gap-1">
								<kbd className="bg-white/10 px-1.5 rounded font-mono">Tab</kbd>{" "}
								Category
							</span>
						</div>
						<div className="font-medium bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
							Neural Command
						</div>
					</div>
				</GlassCard>
			</DialogContent>
		</Dialog>
	);
}
