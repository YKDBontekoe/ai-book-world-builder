import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import {
	Clock,
	FileText,
	HistoryIcon,
	MapPin,
	Send,
	Sparkles,
	Trash2,
	User,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { Separator } from "@/components/atoms/separator";
import { Textarea } from "@/components/atoms/textarea";
import { TOOLS } from "@/features/writer/components/tools/tool-config";
import type { ToolType } from "@/features/writer/components/tools/tool-strategies";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "@/features/writer/components/hooks/use-power-dock-history";
import {
	PowerDockSuggestions,
	type SuggestionItem,
} from "./power-dock-suggestions";

interface Entity {
	id: string;
	name: string;
	kind: string;
	summary: string | null;
}

interface PowerDockInputProps {
	mode: "default" | "tools" | "input";
	selectedTool: ToolType | null;
	input: string;
	isProcessing: boolean;
	setInput: (val: string) => void;
	onExecute: () => void;
	onReset: () => void;
	onClearHistory: (tool: ToolType) => void;
	getHistory: (tool: ToolType) => HistoryItem[];
	entities?: Entity[];
	onExport?: () => void;
}

const COMMANDS: SuggestionItem[] = [
	{
		id: "export",
		label: "Export Scene",
		value: "/export",
		description: "Copy current scene to clipboard",
		icon: FileText,
	},
	{
		id: "clear",
		label: "Clear Input",
		value: "/clear",
		description: "Clear the current input",
		icon: Trash2,
	},
];

export function PowerDockInput({
	mode,
	selectedTool,
	input,
	isProcessing,
	setInput,
	onExecute,
	onReset,
	onClearHistory,
	getHistory,
	entities = [],
	onExport,
}: PowerDockInputProps): React.JSX.Element {
	// Suggestion state
	const [triggerMode, setTriggerMode] = useState<"entity" | "command" | null>(
		null,
	);
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [cursorPosition, setCursorPosition] = useState(0);

	// Filter suggestions based on mode and query
	const suggestions = useMemo(() => {
		if (!triggerMode) return [];

		if (triggerMode === "entity") {
			return entities
				.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 5)
				.map((e) => ({
					id: e.id,
					label: e.name,
					value: e.name,
					description: e.kind,
					icon: e.kind === "location" ? MapPin : User,
				}));
		}

		if (triggerMode === "command") {
			return COMMANDS.filter((c) =>
				c.label.toLowerCase().includes(query.toLowerCase()),
			);
		}

		return [];
	}, [triggerMode, query, entities]);

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const val = e.target.value;
		const pos = e.target.selectionStart;
		setInput(val);
		setCursorPosition(pos);

		// Detect triggers
		const textBeforeCursor = val.slice(0, pos);
		const lastWord = textBeforeCursor.split(/\s+/).pop() || "";

		if (lastWord.startsWith("@")) {
			setTriggerMode("entity");
			setQuery(lastWord.slice(1));
			setSelectedIndex(0);
		} else if (lastWord.startsWith("/")) {
			setTriggerMode("command");
			setQuery(lastWord.slice(1));
			setSelectedIndex(0);
		} else {
			setTriggerMode(null);
		}
	};

	const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
		setCursorPosition(e.currentTarget.selectionStart);
	};

	const handleSelectSuggestion = (item: SuggestionItem) => {
		if (!triggerMode) return;

		if (triggerMode === "command") {
			if (item.value === "/export") {
				onExport?.();
				setInput("");
			} else if (item.value === "/clear") {
				setInput("");
			} else {
				// Just insert
				setInput(item.value);
			}
		} else {
			// Entity: Replace the typed trigger with the entity name
			// We use cursorPosition to replace the text immediately preceding the cursor
			const textBeforeCursor = input.slice(0, cursorPosition);
			const lastAtIndex = textBeforeCursor.lastIndexOf("@");

			if (lastAtIndex !== -1) {
				const prefix = input.slice(0, lastAtIndex);
				const suffix = input.slice(cursorPosition);
				setInput(prefix + item.value + " " + suffix);
			} else {
				// Fallback: simple append if something went wrong with tracking
				setInput(input + item.value);
			}
		}
		setTriggerMode(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (triggerMode && suggestions.length > 0) {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev > 0 ? prev - 1 : suggestions.length - 1,
				);
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev < suggestions.length - 1 ? prev + 1 : 0,
				);
				return;
			}
			if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				handleSelectSuggestion(suggestions[selectedIndex]);
				return;
			}
			if (e.key === "Escape") {
				setTriggerMode(null);
				return;
			}
		}

		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onExecute();
		}
		if (e.key === "Escape") {
			onReset();
		}
	};

	const getPlaceholder = (tool: ToolType) => {
		switch (tool) {
			case "write":
				return "Instructions (e.g., 'Make it tense')";
			case "rewrite":
				return "Instructions (e.g., 'Change to 1st person')";
			case "expand":
				return "Paste notes or outline...";
			case "critique":
				return "Specific questions? (Optional)";
			case "consistency":
				return "Instructions (e.g., 'Ensure consistent tone and terminology')";
			case "dialogue":
				return "Focus (e.g., 'Sharpen Character A's voice')";
			case "lore":
				return "Describe the entity...";
			case "search":
				return "Ask about plot threads, character arcs, or unresolved clues...";
			default:
				return "Enter instructions (Type @ for entities, / for commands)...";
		}
	};

	return (
		<AnimatePresence mode="popLayout">
			{mode === "input" && selectedTool && (
				<motion.div
					initial={{ opacity: 0, width: 0 }}
					animate={{ opacity: 1, width: "auto" }}
					exit={{ opacity: 0, width: 0 }}
					className="flex items-center gap-2 px-1 min-w-[300px] md:min-w-[400px]"
				>
					<div className="flex items-center gap-2 mr-2 text-muted-foreground">
						<Sparkles className="w-4 h-4 text-primary" />
						<span className="text-xs font-bold uppercase">
							{TOOLS.find((t) => t.id === selectedTool)?.label}
						</span>
					</div>

					<div className="flex-1 relative group flex gap-2 items-start">
						<div className="relative flex-1">
							{/* Suggestions Popup */}
							<AnimatePresence>
								{triggerMode && suggestions.length > 0 && (
									<PowerDockSuggestions
										items={suggestions}
										selectedIndex={selectedIndex}
										onSelect={handleSelectSuggestion}
									/>
								)}
							</AnimatePresence>

							<Textarea
								value={input}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								onSelect={handleSelect}
								onClick={handleSelect}
								placeholder={getPlaceholder(selectedTool)}
								className="min-h-[36px] max-h-[100px] py-2 px-3 pr-10 resize-none focus:border-primary/50 text-sm w-full shadow-none"
								autoFocus
							/>
							<button
								type="button"
								onClick={onExecute}
								disabled={isProcessing}
								className="absolute right-1 top-1 p-1.5 hover:bg-primary rounded-md text-muted-foreground hover:text-primary-foreground transition-colors disabled:opacity-50"
							>
								{isProcessing ? (
									<LoadingSpinner size="xs" />
								) : (
									<Send className="w-3 h-3" />
								)}
							</button>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									aria-label="Command history"
									className={cn(
										"p-2 rounded-lg transition-colors border border-transparent",
										"hover:bg-white/10 text-muted-foreground hover:text-foreground",
										getHistory(selectedTool).length > 0 &&
											"text-primary/70 hover:text-primary hover:border-primary/20",
									)}
								>
									<HistoryIcon className="w-4 h-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								side="top"
								className="w-64 max-h-60"
							>
								<DropdownMenuLabel className="flex items-center justify-between text-xs font-normal text-muted-foreground">
									<span>Recent {selectedTool} commands</span>
									<button
										type="button"
										aria-label="Clear history for this tool"
										onClick={() => onClearHistory(selectedTool)}
										className="p-1 hover:text-destructive transition-colors"
										title="Clear history for this tool"
									>
										<Trash2 className="w-3 h-3" />
									</button>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{getHistory(selectedTool).length === 0 ? (
									<div className="p-2 text-xs text-muted-foreground text-center italic">
										No recent history
									</div>
								) : (
									getHistory(selectedTool).map((item, idx) => (
										<DropdownMenuItem
											key={`${item.timestamp}-${idx}`}
											onClick={() => setInput(item.input)}
											className="flex items-start gap-2 py-2 cursor-pointer"
										>
											<Clock className="w-3 h-3 mt-0.5 shrink-0 opacity-50" />
											<span className="line-clamp-2 text-xs">{item.input}</span>
										</DropdownMenuItem>
									))
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<Separator orientation="vertical" className="h-6 mx-1 bg-white/10" />

					<button
						type="button"
						aria-label="Close"
						onClick={onReset}
						className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
