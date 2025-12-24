"use client";

import { motion } from "framer-motion";
import {
	AlertTriangle,
	BookOpenCheck,
	Edit,
	Expand,
	Feather,
	Globe,
	Search,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	analyzeConsistencyAction,
	batchWriteChapterAction,
	critiqueChapterAction,
	expandSceneAction,
	generateLoreAction,
	rewriteSceneAction,
	searchProjectAction,
} from "@/app/actions/ai-operations";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContext } from "@/components/organisms/writer/writer-context";

interface AIToolsMenuProps {
	isOpen: boolean;
	onClose: () => void;
}

type ToolType =
	| "write"
	| "rewrite"
	| "expand"
	| "critique"
	| "consistency"
	| "lore"
	| "search"
	| null;

export function AIToolsMenu({ isOpen, onClose }: AIToolsMenuProps) {
	const { activeSceneId, activeChapterId, project, structure } =
		useWriterContext();

	const [selectedTool, setSelectedTool] = useState<ToolType>(null);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	const reset = () => {
		setSelectedTool(null);
		setInput("");
		setResult(null);
		setLoading(false);
	};

	const handleExecute = async () => {
		if (!project?.id) return;
		setLoading(true);
		setResult(null);

		try {
			if (selectedTool === "write") {
				if (!activeChapterId) {
					toast.error("No active chapter selected.");
					return;
				}
				const res = await batchWriteChapterAction(activeChapterId, input);
				if (res.success) {
					// We must cast or check properties, but Server Actions return union types often.
					// Assuming generic Result structure: { success: true, writtenCount: number }
					if ('writtenCount' in res) {
						toast.success(`Generated content for ${res.writtenCount} scenes.`);
					}
					onClose();
				} else {
					if ('error' in res) toast.error(res.error);
				}
			} else if (selectedTool === "rewrite") {
				if (!activeSceneId) {
					toast.error("No active scene selected.");
					return;
				}
				const res = await rewriteSceneAction(activeSceneId, input);
				// Check for 'text' in result
				if ('text' in res) {
					setResult(res.text); // Show preview
				} else {
					if ('error' in res) toast.error(res.error);
				}
			} else if (selectedTool === "expand") {
				if (!activeSceneId) {
					toast.error("No active scene selected.");
					return;
				}
				const res = await expandSceneAction(activeSceneId, input);
				if ('text' in res) {
					setResult(res.text); // Show preview
				} else {
					if ('error' in res) toast.error(res.error);
				}
			} else if (selectedTool === "critique") {
				if (!activeChapterId) {
					toast.error("No active chapter selected.");
					return;
				}
				const res = await critiqueChapterAction(activeChapterId);
				if (res.success && 'data' in res) {
					setResult(JSON.stringify(res.data, null, 2));
				} else {
					if ('error' in res) toast.error(res.error);
				}
			} else if (selectedTool === "consistency") {
				if (!activeChapterId) {
					toast.error("No active chapter selected.");
					return;
				}
				const res = await analyzeConsistencyAction(activeChapterId);
				if (res.success && 'data' in res) {
					setResult(JSON.stringify(res.data, null, 2));
				} else {
					if ('error' in res) toast.error(res.error);
				}
			} else if (selectedTool === "lore") {
				const res = await generateLoreAction(project.id, input, "lore");
				if (res.success && 'entity' in res && res.entity) {
					toast.success(`Created entity: ${res.entity.name}`);
					onClose();
				} else {
					if ('error' in res) toast.error(res.error);
				}
			} else if (selectedTool === "search") {
				const res = await searchProjectAction(project.id, input);
				if (res.success && 'answer' in res) {
					setResult(res.answer || null);
				} else {
					if ('error' in res) toast.error(res.error);
				}
			}
		} catch (_e) {
			toast.error("Operation failed.");
		} finally {
			setLoading(false);
		}
	};

	// Helper to get active context name
	const getActiveContextName = () => {
		if (activeChapterId) {
			const chap = structure?.find((c) => c.id === activeChapterId);
			if (chap) return `Chapter: ${chap.title}`;
		}
		if (activeSceneId) {
			// Find scene in structure
			if (structure) {
				for (const chap of structure) {
					const scn = chap.scenes.find((s) => s.id === activeSceneId);
					if (scn) return `Scene: ${scn.title}`;
				}
			}
		}
		return "No Context Selected";
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(v) => {
				if (!v) {
					reset();
					onClose();
				}
			}}
		>
			<DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
				<GlassCard
					variant="liquid"
					className="flex flex-col h-[600px] overflow-hidden rounded-2xl border-white/20 shadow-2xl backdrop-blur-3xl"
				>
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
						<div className="flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" />
							<span className="font-semibold text-lg">AI Toolkit</span>
						</div>
						<div className="text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded">
							{getActiveContextName()}
						</div>
					</div>

					<div className="flex flex-1 overflow-hidden">
						{/* Sidebar Menu */}
						<div className="w-64 border-r border-white/10 bg-black/10 p-4 space-y-6">
							<div>
								<div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
									Creation
								</div>
								<div className="space-y-1">
									<MenuButton
										icon={Feather}
										label="Batch Write"
										active={selectedTool === "write"}
										onClick={() => {
											reset();
											setSelectedTool("write");
										}}
									/>
									<MenuButton
										icon={Edit}
										label="Rewrite Scene"
										active={selectedTool === "rewrite"}
										onClick={() => {
											reset();
											setSelectedTool("rewrite");
										}}
									/>
									<MenuButton
										icon={Expand}
										label="Expand Skeleton"
										active={selectedTool === "expand"}
										onClick={() => {
											reset();
											setSelectedTool("expand");
										}}
									/>
								</div>
							</div>

							<div>
								<div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
									Analysis
								</div>
								<div className="space-y-1">
									<MenuButton
										icon={BookOpenCheck}
										label="Critique Chapter"
										active={selectedTool === "critique"}
										onClick={() => {
											reset();
											setSelectedTool("critique");
										}}
									/>
									<MenuButton
										icon={AlertTriangle}
										label="Check Consistency"
										active={selectedTool === "consistency"}
										onClick={() => {
											reset();
											setSelectedTool("consistency");
										}}
									/>
								</div>
							</div>

							<div>
								<div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
									Knowledge
								</div>
								<div className="space-y-1">
									<MenuButton
										icon={Globe}
										label="Generate Lore"
										active={selectedTool === "lore"}
										onClick={() => {
											reset();
											setSelectedTool("lore");
										}}
									/>
									<MenuButton
										icon={Search}
										label="Search Project"
										active={selectedTool === "search"}
										onClick={() => {
											reset();
											setSelectedTool("search");
										}}
									/>
								</div>
							</div>
						</div>

						{/* Content Area */}
						<div className="flex-1 p-6 overflow-y-auto bg-white/5">
							{!selectedTool ? (
								<div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
									<Sparkles className="w-12 h-12 mb-4" />
									<p>Select a tool to begin</p>
								</div>
							) : (
								<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
									<div>
										<h2 className="text-xl font-bold mb-1 capitalize">
											{selectedTool.replace("-", " ")}
										</h2>
										<p className="text-sm text-muted-foreground">
											{getToolDescription(selectedTool)}
										</p>
									</div>

									{/* Tool Specific Inputs */}
									<div className="space-y-4">
										{selectedTool === "write" && (
											<div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
												This will iterate through all scenes in the current
												chapter and generate text for any empty scenes.
											</div>
										)}

										<div className="space-y-2">
											<label className="text-sm font-medium">
												Instructions / Prompt
											</label>
											<Textarea
												value={input}
												onChange={(e) => setInput(e.target.value)}
												placeholder={getPlaceholder(selectedTool)}
												className="min-h-[120px] bg-black/20 border-white/10 focus:border-primary/50"
											/>
										</div>

										<button
											type="button"
											disabled={loading}
											onClick={handleExecute}
											className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors w-full flex items-center justify-center gap-2"
										>
											{loading ? (
												<>
													<span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
													Processing...
												</>
											) : (
												<>
													<Sparkles className="w-4 h-4" /> Run Action
												</>
											)}
										</button>
									</div>

									{/* Results Area */}
									{result && (
										<div className="mt-6 pt-6 border-t border-white/10">
											<h3 className="font-medium mb-2">Result</h3>
											<div className="bg-black/30 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap h-64 overflow-y-auto border border-white/5">
												{result}
											</div>
											<div className="mt-2 text-xs text-muted-foreground text-center">
												{selectedTool === "rewrite" ||
												selectedTool === "expand"
													? "Copy the text above and paste it into your editor."
													: "Review the analysis above."}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</GlassCard>
			</DialogContent>
		</Dialog>
	);
}

function MenuButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: any;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
				active
					? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
					: "text-muted-foreground hover:bg-white/10 hover:text-foreground"
			}`}
		>
			<Icon className="w-4 h-4" />
			{label}
		</button>
	);
}

function getToolDescription(tool: ToolType) {
	switch (tool) {
		case "write":
			return "Auto-generate text for multiple scenes in sequence.";
		case "rewrite":
			return "Transform existing scene text based on new direction.";
		case "expand":
			return "Turn skeletal notes into full prose.";
		case "critique":
			return "Get AI feedback on pacing, tone, and quality.";
		case "consistency":
			return "Check for plot holes and continuity errors.";
		case "lore":
			return "Create new world-building entities.";
		case "search":
			return "Find facts within your project notes.";
		default:
			return "";
	}
}

function getPlaceholder(tool: ToolType) {
	switch (tool) {
		case "write":
			return "e.g., 'Make the dialogue snappy and the atmosphere tense.'";
		case "rewrite":
			return "e.g., 'Change the POV to 1st person' or 'Add more sensory details.'";
		case "expand":
			return "Paste your scene outline or notes here...";
		case "critique":
			return "(Optional) specific questions for the reviewer...";
		case "lore":
			return "e.g., 'A secret society of mages hiding in New York.'";
		case "search":
			return "e.g., 'What color are the protagonist's eyes?'";
		default:
			return "Enter instructions...";
	}
}
