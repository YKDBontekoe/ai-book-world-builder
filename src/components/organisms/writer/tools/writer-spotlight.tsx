"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	CommandIcon,
	MapPin,
	SearchIcon,
	Sparkles,
	Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { cn } from "@/lib/utils";

export function WriterSpotlight() {
	const { isSpotlightOpen, toggleSpotlight, setChatOpen } = useWriterControl();
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// Focus on open
	useEffect(() => {
		if (isSpotlightOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
			setQuery("");
		}
	}, [isSpotlightOpen]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && query.trim()) {
			e.preventDefault();
			// Action: Ask AI
			// 1. Close spotlight
			toggleSpotlight();
			// 2. Open chat
			setChatOpen(true);
			// 3. Send message (This requires access to chat context or a way to preset the input)
			// For now, let's assume the user will type it there or we pass it via a global state/event?
			// A simple hack: Copy to clipboard? No.
			// Better: We should probably just let the user ask "Quick Questions" here and see the answer here?
			// The requirement was "quickly ask questions ... like macOS ray cast".
			// Raycast often shows results inline.
			// But integrating full chat here is complex.
			// Let's stick to "Open Chat with Prompt" or "Search Entities".

			// If it starts with "Ask AI: ", we could open chat.
			// For now, let's just make it a "Search / Command" interface.

			console.log("Execute command:", query);
		}
	};

	// Mock Data for now
	const suggestions = [
		{ id: "1", label: "Summarize Chapter", icon: Sparkles, type: "action" },
		{ id: "2", label: "List Characters", icon: Users, type: "entity" },
		{ id: "3", label: "Describe Setting", icon: MapPin, type: "entity" },
	].filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

	return (
		<Dialog open={isSpotlightOpen} onOpenChange={toggleSpotlight}>
			<DialogContent
				className="max-w-xl p-0 gap-0 overflow-hidden bg-transparent border-none shadow-none sm:max-w-xl"
				hideCloseButton
			>
				<GlassCard
					variant="liquid"
					className="flex flex-col overflow-hidden rounded-2xl border-white/20"
				>
					{/* Search Input */}
					<div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/5">
						<SearchIcon className="w-5 h-5 text-muted-foreground" />
						<input
							ref={inputRef}
							className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 text-foreground"
							placeholder="Ask AI or search..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
						<div className="flex items-center gap-1">
							<kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 rounded bg-white/10 text-[10px] font-medium text-muted-foreground">
								ESC
							</kbd>
						</div>
					</div>

					{/* Results / Suggestions */}
					<div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
						{suggestions.length > 0 ? (
							suggestions.map((item, i) => (
								<motion.button
									type="button"
									key={item.id}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: i * 0.05 }}
									className={cn(
										"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group",
										"hover:bg-primary/10 hover:scale-[1.01] active:scale-[0.99]",
									)}
									onClick={() => {
										setQuery(item.label);
										// Execute immediately?
									}}
								>
									<div
										className={cn(
											"p-2 rounded-lg bg-white/5 text-muted-foreground group-hover:text-primary transition-colors",
											item.type === "action" && "bg-primary/10 text-primary",
										)}
									>
										<item.icon className="w-4 h-4" />
									</div>
									<div className="flex-1">
										<div className="font-medium text-sm">{item.label}</div>
									</div>
									<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all" />
								</motion.button>
							))
						) : (
							<div className="py-8 text-center text-muted-foreground text-sm">
								No results found. Press Enter to ask AI.
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="bg-white/5 px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-muted-foreground">
						<div className="flex gap-3">
							<span className="flex items-center gap-1">
								<CommandIcon className="w-3 h-3" /> Actions
							</span>
							<span className="flex items-center gap-1">
								<Users className="w-3 h-3" /> Entities
							</span>
						</div>
						<div>Writer OS</div>
					</div>
				</GlassCard>
			</DialogContent>
		</Dialog>
	);
}
