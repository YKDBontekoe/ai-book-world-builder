"use client";

import { motion } from "framer-motion";
import {
	SearchIcon,
	FolderIcon,
	MessageSquareIcon,
	PlusIcon,
	KeyboardIcon,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/animations";

export interface Command {
	id: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	category: "Navigation" | "Projects" | "Chat" | "Generation" | "Settings";
	keywords?: string[];
	action: () => void;
	shortcut?: string;
}

interface CommandPaletteProps {
	isOpen: boolean;
	onClose: () => void;
	commands?: Command[];
}

const defaultCommands: Command[] = [
	{
		id: "new-project",
		label: "New Project",
		description: "Create a new book project",
		icon: <PlusIcon size={16} />,
		category: "Projects",
		keywords: ["create", "add", "project"],
		action: () => {
			window.location.href = "/projects?new=true";
		},
		shortcut: "⌘N",
	},
	{
		id: "view-projects",
		label: "View All Projects",
		description: "Navigate to projects page",
		icon: <FolderIcon size={16} />,
		category: "Navigation",
		keywords: ["projects", "list", "browse"],
		action: () => {
			window.location.href = "/projects";
		},
	},
	{
		id: "new-chat",
		label: "New Chat",
		description: "Start a new conversation",
		icon: <MessageSquareIcon size={16} />,
		category: "Chat",
		keywords: ["conversation", "message"],
		action: () => {
			window.location.href = "/";
		},
	},
	{
		id: "keyboard-shortcuts",
		label: "Keyboard Shortcuts",
		description: "View all keyboard shortcuts",
		icon: <KeyboardIcon size={16} />,
		category: "Settings",
		keywords: ["help", "keys", "hotkeys"],
		action: () => {
			// Will be implemented with shortcuts dialog
			console.log("Show shortcuts dialog");
		},
		shortcut: "⌘/",
	},
];

export function CommandPalette({
	isOpen,
	onClose,
	commands = defaultCommands,
}: CommandPaletteProps) {
	const [search, setSearch] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	// Filter commands based on search
	const filteredCommands = useMemo(() => {
		if (!search.trim()) return commands;

		const searchLower = search.toLowerCase();
		return commands.filter((cmd) => {
			const labelMatch = cmd.label.toLowerCase().includes(searchLower);
			const descMatch = cmd.description?.toLowerCase().includes(searchLower);
			const keywordMatch = cmd.keywords?.some((kw) =>
				kw.toLowerCase().includes(searchLower)
			);
			return labelMatch || descMatch || keywordMatch;
		});
	}, [search, commands]);

	// Group commands by category
	const groupedCommands = useMemo(() => {
		const groups: Record<string, Command[]> = {};
		for (const cmd of filteredCommands) {
			if (!groups[cmd.category]) {
				groups[cmd.category] = [];
			}
			groups[cmd.category].push(cmd);
		}
		return groups;
	}, [filteredCommands]);

	// Reset selection when search changes
	useEffect(() => {
		setSelectedIndex(0);
	}, [filteredCommands]);

	// Focus input when opened
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
			setSearch("");
			setSelectedIndex(0);
		}
	}, [isOpen]);

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev < filteredCommands.length - 1 ? prev + 1 : prev
				);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
			} else if (e.key === "Enter") {
				e.preventDefault();
				const selected = filteredCommands[selectedIndex];
				if (selected) {
					selected.action();
					onClose();
				}
			} else if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, selectedIndex, filteredCommands, onClose]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
				onPointerDownOutside={onClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: -20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: -20 }}
					transition={springs.liquid}
					className="flex flex-col"
				>
					{/* Search Input */}
					<div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
						<SearchIcon size={18} className="text-muted-foreground shrink-0" />
						<input
							ref={inputRef}
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search commands..."
							className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
						/>
						<kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
							ESC
						</kbd>
					</div>

					{/* Commands List */}
					<div className="max-h-[400px] overflow-y-auto p-2">
						{Object.keys(groupedCommands).length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<SearchIcon size={32} className="text-muted-foreground/50 mb-3" />
								<p className="text-sm text-muted-foreground">
									No commands found for "{search}"
								</p>
							</div>
						) : (
							Object.entries(groupedCommands).map(([category, cmds]) => (
								<div key={category} className="mb-4 last:mb-0">
									<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										{category}
									</div>
									<div className="space-y-1">
										{cmds.map((cmd) => {
											const globalIndex = filteredCommands.indexOf(cmd);
											const isSelected = globalIndex === selectedIndex;

											return (
												<motion.button
													key={cmd.id}
													onClick={() => {
														cmd.action();
														onClose();
													}}
													onMouseEnter={() => setSelectedIndex(globalIndex)}
													className={cn(
														"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
														isSelected
															? "bg-primary/10 text-primary"
															: "hover:bg-muted/50"
													)}
													whileHover={{ scale: 1.01 }}
													whileTap={{ scale: 0.99 }}
													transition={springs.liquid}
												>
													<div
														className={cn(
															"flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
															isSelected
																? "bg-primary/20 text-primary"
																: "bg-muted text-muted-foreground"
														)}
													>
														{cmd.icon}
													</div>
													<div className="flex-1 min-w-0">
														<div className="font-medium text-sm truncate">
															{cmd.label}
														</div>
														{cmd.description && (
															<div className="text-xs text-muted-foreground truncate">
																{cmd.description}
															</div>
														)}
													</div>
													{cmd.shortcut && (
														<kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground shrink-0">
															{cmd.shortcut}
														</kbd>
													)}
												</motion.button>
											);
										})}
									</div>
								</div>
							))
						)}
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between border-t border-border/50 px-4 py-2 text-xs text-muted-foreground">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1.5">
								<kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-muted text-[10px] font-medium">
									↑
								</kbd>
								<kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-muted text-[10px] font-medium">
									↓
								</kbd>
								<span>Navigate</span>
							</div>
							<div className="flex items-center gap-1.5">
								<kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded bg-muted text-[10px] font-medium">
									↵
								</kbd>
								<span>Select</span>
							</div>
						</div>
						<div className="flex items-center gap-1.5">
							<kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded bg-muted text-[10px] font-medium">
								ESC
							</kbd>
							<span>Close</span>
						</div>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
