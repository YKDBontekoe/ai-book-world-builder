import { AnimatePresence, motion } from "framer-motion";
import { Clock, HistoryIcon, Send, Sparkles, Trash2, X } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Separator } from "@/components/atoms/separator";
import { Textarea } from "@/components/atoms/textarea";
import { TOOLS } from "@/features/writer/components/tools/tool-config";
import { cn } from "@/lib/utils";
import type { ToolType } from "@/features/writer/components/tools/tool-strategies";

interface PowerDockInputProps {
	mode: "default" | "tools" | "input";
	selectedTool: ToolType | null;
	input: string;
	isProcessing: boolean;
	setInput: (val: string) => void;
	onExecute: () => void;
	onReset: () => void;
	onClearHistory: (tool: ToolType) => void;
	getHistory: (tool: ToolType) => { input: string; timestamp: number }[];
}

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
}: PowerDockInputProps) {
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
			case "lore":
				return "Describe the entity...";
			case "search":
				return "What are you looking for?";
			default:
				return "Enter instructions...";
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
							<Textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={getPlaceholder(selectedTool)}
								className="min-h-[36px] max-h-[100px] py-2 px-3 pr-10 resize-none bg-white/5 border-white/10 focus:border-primary/50 text-sm rounded-lg w-full"
								autoFocus
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										onExecute();
									}
									if (e.key === "Escape") {
										onReset();
									}
								}}
							/>
							<button
								type="button"
								onClick={onExecute}
								disabled={isProcessing}
								className="absolute right-1 top-1 p-1.5 hover:bg-primary rounded-md text-muted-foreground hover:text-primary-foreground transition-colors disabled:opacity-50"
							>
								{isProcessing ? (
									<span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin block" />
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
