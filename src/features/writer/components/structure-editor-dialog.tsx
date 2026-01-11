"use client";

import {
	FilePlus,
	FolderPlus,
	Keyboard,
	LayoutTemplate,
	Loader2,
	Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { saveProjectStructure } from "@/features/writer/actions";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/atoms/dialog";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { Textarea } from "@/components/atoms/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { cn } from "@/lib/utils";

interface StructureEditorDialogProps {
	projectId: string;
	currentStructure: string;
	onSave: () => void;
	children: React.ReactNode;
}

interface ParsedNode {
	type: "chapter" | "scene" | "unknown";
	title: string;
	children?: ParsedNode[];
	lineIndex: number;
}

export function StructureEditorDialog({
	projectId,
	currentStructure,
	onSave,
	children,
}: StructureEditorDialogProps) {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState(currentStructure);
	const [isSaving, setIsSaving] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Update text when currentStructure changes
	useEffect(() => {
		if (open) {
			setText(currentStructure);
		}
	}, [currentStructure, open]);

	const handleSave = async () => {
		setIsSaving(true);
		const result = await saveProjectStructure({
			projectId,
			structureText: text,
		});
		setIsSaving(false);

		if (result.success) {
			toast.success("Structure updated successfully");
			setOpen(false);
			onSave();
		} else {
			toast.error(result.error || "Failed to update structure");
		}
	};

	// ---------------------------------------------------------------------------
	// Power Features Logic
	// ---------------------------------------------------------------------------

	const insertText = (template: string) => {
		if (!textareaRef.current) return;
		const start = textareaRef.current.selectionStart;
		const end = textareaRef.current.selectionEnd;
		const newText =
			text.substring(0, start) + template + text.substring(end, text.length);
		setText(newText);

		// Defer focus and selection update to next tick
		setTimeout(() => {
			if (!textareaRef.current) return;
			textareaRef.current.focus();
			textareaRef.current.selectionStart = start + template.length;
			textareaRef.current.selectionEnd = start + template.length;
		}, 0);
	};

	const handleSmartFormat = () => {
		const lines = text.split("\n");
		const formattedLines: string[] = [];
		let chapterCount = 0;
		let sceneCount = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) continue;

			// Detect Chapter
			if (
				line.toLowerCase().startsWith("chapter") ||
				/^\d+\./.test(line) ||
				(line.endsWith(":") && !line.toLowerCase().includes("scene"))
			) {
				chapterCount++;
				sceneCount = 0;
				// Clean up title
				let title = line
					.replace(/^chapter\s*\d*[:.]?\s*/i, "")
					.replace(/^\d+\.\s*/, "")
					.replace(/:$/, "");
				if (!title) title = "Untitled Chapter";

				if (formattedLines.length > 0) {
					formattedLines.push("");
				}
				formattedLines.push(`Chapter ${chapterCount}: ${title}`);
			}
			// Detect Scene
			else if (
				line.toLowerCase().startsWith("scene") ||
				line.startsWith("-") ||
				line.startsWith("*")
			) {
				sceneCount++;
				let title = line
					.replace(/^[-*]\s*/, "")
					.replace(/^scene\s*\d*[:.]?\s*/i, "");
				if (!title) title = "Untitled Scene";

				formattedLines.push(`  Scene ${sceneCount}: ${title}`);
			}
			// Treat loose text as scene if we are inside a chapter
			else if (chapterCount > 0) {
				sceneCount++;
				formattedLines.push(`  Scene ${sceneCount}: ${line}`);
			}
			// Treat loose text at start as Chapter if no chapter yet
			else {
				chapterCount++;
				formattedLines.push(`Chapter ${chapterCount}: ${line}`);
			}
		}

		const newText = formattedLines.join("\n");
		setText(newText);
		toast.success("Structure formatted!");
	};

	const parsedStructure = useMemo(() => {
		const lines = text.split("\n");
		const nodes: ParsedNode[] = [];
		let currentChapter: ParsedNode | null = null;

		lines.forEach((line, index) => {
			const trimmed = line.trim();
			if (!trimmed) return;

			if (trimmed.match(/^chapter/i)) {
				currentChapter = {
					type: "chapter",
					title: trimmed,
					children: [],
					lineIndex: index,
				};
				nodes.push(currentChapter);
			} else if (trimmed.match(/^(-|scene)/i)) {
				const sceneNode: ParsedNode = {
					type: "scene",
					title: trimmed.replace(/^[-]\s*/, ""),
					lineIndex: index,
				};
				if (currentChapter) {
					currentChapter.children?.push(sceneNode);
				} else {
					nodes.push({ ...sceneNode, type: "unknown" });
				}
			} else {
				// Fallback for typed text that isn't clearly formatted
				if (currentChapter) {
					currentChapter.children?.push({
						type: "scene",
						title: trimmed,
						lineIndex: index,
					});
				} else {
					nodes.push({
						type: "chapter",
						title: trimmed,
						lineIndex: index,
					});
					currentChapter = nodes[nodes.length - 1];
				}
			}
		});
		return nodes;
	}, [text]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className={cn(
					"flex flex-col transition-all duration-300 gap-0 p-0 overflow-hidden",
					showPreview
						? "sm:max-w-[900px] h-[85vh]"
						: "sm:max-w-[600px] h-[80vh]",
				)}
			>
				<DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/20">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>Structure Editor</DialogTitle>
							<DialogDescription className="mt-1">
								Power edit your book's outline using plain text.
							</DialogDescription>
						</div>
						<div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-foreground"
											onClick={() => insertText("\n\nChapter: ")}
										>
											<FolderPlus className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Insert Chapter</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-foreground"
											onClick={() => insertText("\n  Scene: ")}
										>
											<FilePlus className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Insert Scene</TooltipContent>
								</Tooltip>

								<div className="w-px h-4 bg-border/50 mx-1" />

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
											onClick={handleSmartFormat}
										>
											<Wand2 className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Smart Format</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className={cn(
												"h-8 w-8 transition-colors",
												showPreview
													? "bg-primary/10 text-primary"
													: "text-muted-foreground hover:text-foreground",
											)}
											onClick={() => setShowPreview(!showPreview)}
										>
											<LayoutTemplate className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Toggle Preview</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 flex overflow-hidden">
					<div className={cn("flex-1 flex flex-col min-w-0")}>
						<Textarea
							ref={textareaRef}
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={(e) => {
								if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
									e.preventDefault();
									handleSave();
								}
							}}
							className="flex-1 resize-none font-mono text-sm border-0 focus-visible:ring-0 rounded-none p-6 leading-relaxed bg-transparent"
							placeholder={`Chapter 1: The Beginning
  Scene 1: Waking up
  Scene 2: The Call

Chapter 2: The Journey
  Scene 1: Departure`}
						/>
					</div>

					{/* Preview Panel */}
					{showPreview && (
						<div className="w-[300px] border-l border-border/50 bg-muted/10 flex flex-col animate-in slide-in-from-right-10 duration-200">
							<div className="px-4 py-3 border-b border-border/50 text-xs font-semibold text-muted-foreground bg-muted/20">
								Structure Preview
							</div>
							<ScrollArea className="flex-1 p-4">
								<div className="space-y-4">
									{parsedStructure.map((node) => (
										<div key={node.lineIndex} className="space-y-1">
											<div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
												<FolderPlus className="h-3.5 w-3.5 text-primary/70" />
												<span className="truncate">{node.title}</span>
											</div>
											{node.children && node.children.length > 0 && (
												<div className="pl-4 space-y-1 mt-1 border-l border-border/50 ml-1.5">
													{node.children.map((child) => (
														<div
															key={child.lineIndex}
															className="flex items-center gap-2 text-xs text-muted-foreground py-0.5"
														>
															<FilePlus className="h-3 w-3 opacity-50" />
															<span className="truncate">{child.title}</span>
														</div>
													))}
												</div>
											)}
										</div>
									))}
									{parsedStructure.length === 0 && (
										<div className="text-xs text-muted-foreground/50 italic text-center py-8">
											Start typing to see your structure tree...
										</div>
									)}
								</div>
							</ScrollArea>
						</div>
					)}
				</div>

				<DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/20">
					<div className="mr-auto flex items-center gap-2 text-xs text-muted-foreground opacity-70">
						<Keyboard className="h-3 w-3" />
						<span>Cmd/Ctrl + Enter to save</span>
					</div>
					<Button variant="ghost" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
