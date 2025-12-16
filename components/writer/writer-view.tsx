"use client";

import {
	ArrowLeft,
	BookOpen,
	FileText,
	GitBranch,
	Loader2,
	Save,
	Sparkles,
	StickyNote,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAvailableChatModels } from "@/app/actions/models";
import { FloatingChat } from "@/components/chat/floating-chat";
import { Editor } from "@/components/editor/text-editor";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIWriterPanel } from "@/components/writer/ai-writer-panel";
import { useWriterState, type Chapter, type Scene } from "@/components/writer/hooks/use-writer-state";
import { StructureEditorDialog } from "@/components/writer/structure-editor-dialog";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { NodeGraph } from "./node-view/node-graph";

// Dynamic imports for performance
const _BiblePane = dynamic(
	() => import("../book-canvas/panes/bible-pane").then((mod) => mod.BiblePane),
	{ loading: () => <Loader2 className="animate-spin" /> },
);
const _TimelinePane = dynamic(
	() =>
		import("../book-canvas/panes/timeline-pane").then(
			(mod) => mod.TimelinePane,
		),
	{ loading: () => <Loader2 className="animate-spin" /> },
);

interface WriterViewProps {
	project: Project;
	isOwner: boolean;
}

export function WriterView({ project, _isOwner }: WriterViewProps & { _isOwner?: boolean }) {
	const {
		structure,
		structureText,
		loading,
		activeSceneId,
		setActiveSceneId,
		sceneContent,
		handleContentChange,
		isSaving,
		lastSaved,
		isSnapshotting,
		handleSnapshot,
		handleCreateBranch,
		fetchStructure
	} = useWriterState(project.id);

	const [showAIWriter, setShowAIWriter] = useState(false);

	// Right Sidebar State
	const [activeRightTab, setActiveRightTab] = useState("flow");
	const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

	// Chat Models State
	const [availableModels, setAvailableModels] = useState<any[]>([]);

	// Flattened scenes list for NodeGraph
	const allScenes = useMemo(() => {
		return structure?.flatMap((c) => c.scenes) || [];
	}, [structure]);

	// Find the active scene object
	const activeScene = allScenes.find((s) => s.id === activeSceneId);

	// Fetch models for chat
	useEffect(() => {
		getAvailableChatModels().then(setAvailableModels);
	}, []);

	return (
		<div className="flex flex-col h-dvh bg-background overflow-hidden relative">
			{/* Header */}
			<header className="h-12 border-b flex items-center px-4 shrink-0 bg-background/80 backdrop-blur-md z-10 justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild className="h-8 w-8">
						<Link href="/projects">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm">{project.name}</span>
						<span className="text-muted-foreground text-xs">/</span>
						<span className="text-sm text-muted-foreground">
							{activeScene?.title || "Overview"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant={isRightSidebarOpen ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
						className="h-8 text-xs"
					>
						<GitBranch className="mr-2 h-3 w-3" />
						Story Flow
					</Button>
				</div>
			</header>

			<ResizablePanelGroup
				direction="horizontal"
				className="flex-1 overflow-hidden"
			>
				{/* Left Sidebar: Outline */}
				<ResizablePanel
					defaultSize={20}
					minSize={15}
					maxSize={30}
					className="border-r bg-muted/20 backdrop-blur-xl"
				>
					<div className="flex flex-col h-full">
						<div className="p-3 border-b flex items-center justify-between">
							<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Outline
							</span>
							<StructureEditorDialog
								project={project}
								initialStructureText={structureText}
								onStructureUpdate={fetchStructure}
							/>
						</div>
						<ScrollArea className="flex-1">
							{loading ? (
								<div className="flex justify-center p-4">
									<Loader2 className="animate-spin h-4 w-4" />
								</div>
							) : (
								<Accordion
									type="multiple"
									defaultValue={structure?.map((c) => c.id) || []}
									className="w-full"
								>
									{structure?.map((chapter) => (
										<AccordionItem
											key={chapter.id}
											value={chapter.id}
											className="border-b-0 px-2"
										>
											<AccordionTrigger className="hover:no-underline py-2 text-sm font-medium">
												<span className="truncate text-left">
													{chapter.title}
												</span>
											</AccordionTrigger>
											<AccordionContent className="pb-2 pt-0">
												<div className="flex flex-col gap-0.5 pl-2 border-l ml-2">
													{chapter.scenes
														.filter((s) => s.isActive !== false)
														.map((scene) => (
															<Button
																key={scene.id}
																variant={
																	activeSceneId === scene.id
																		? "secondary"
																		: "ghost"
																}
																size="sm"
																className={cn(
																	"justify-start h-7 px-2 text-xs font-normal w-full",
																	activeSceneId === scene.id &&
																		"bg-secondary/80 font-medium",
																)}
																onClick={() => setActiveSceneId(scene.id)}
															>
																<FileText className="mr-2 h-3 w-3 opacity-70" />
																<span className="truncate">{scene.title}</span>
															</Button>
														))}
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							)}
						</ScrollArea>
					</div>
				</ResizablePanel>

				<ResizableHandle />

				{/* Center: Editor */}
				<ResizablePanel defaultSize={50} minSize={30}>
					<div className="flex flex-col h-full relative bg-background">
						{/* Editor Toolbar */}
						<div className="flex items-center justify-between border-b px-4 py-2 shrink-0 bg-background/50 backdrop-blur-sm z-10">
							<div className="flex items-center gap-2">
								{activeScene && (
									<Button
										variant="outline"
										size="sm"
										className="h-7 text-xs gap-1.5"
										onClick={() => setShowAIWriter(!showAIWriter)}
									>
										<Sparkles className="h-3 w-3 text-purple-500" />
										AI Assist
									</Button>
								)}
							</div>
							<div className="flex items-center gap-3 text-xs text-muted-foreground">
								{isSaving ? (
									<span className="flex items-center gap-1.5">
										<Loader2 className="h-3 w-3 animate-spin" /> Saving...
									</span>
								) : lastSaved ? (
									<span className="flex items-center gap-1.5">
										<Save className="h-3 w-3" /> Saved
									</span>
								) : null}
							</div>
						</div>

						{/* Editor Area */}
						<div className="flex-1 overflow-hidden relative">
							{activeSceneId ? (
								<div className="h-full overflow-y-auto">
									<div className="max-w-3xl mx-auto min-h-full py-12 px-8">
										{showAIWriter && activeScene && (
											<div className="mb-8 border rounded-lg p-4 bg-muted/30">
												<AIWriterPanel
													sceneId={activeSceneId}
													projectId={project.id}
													onContentGenerated={(content) =>
														handleContentChange(
															sceneContent
																? `${sceneContent}\n${content}`
																: content,
														)
													}
													onClose={() => setShowAIWriter(false)}
												/>
											</div>
										)}
										<Editor
											key={activeSceneId}
											content={sceneContent}
											onSaveContent={handleContentChange}
											status="idle"
											isCurrentVersion={true}
											currentVersionIndex={0}
											suggestions={[]}
										/>
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
									<div className="p-4 rounded-full bg-muted/50">
										<BookOpen className="h-8 w-8 opacity-50" />
									</div>
									<p>Select a scene from the outline to start writing</p>
								</div>
							)}
						</div>
					</div>
				</ResizablePanel>

				{/* Right: Creative Suite */}
				{isRightSidebarOpen && (
					<>
						<ResizableHandle />
						<ResizablePanel
							defaultSize={30}
							minSize={20}
							maxSize={45}
							className="bg-muted/10 border-l"
						>
							<div className="flex flex-col h-full">
								<Tabs
									value={activeRightTab}
									onValueChange={setActiveRightTab}
									className="flex-1 flex flex-col"
								>
									<div className="border-b px-2 pt-2 bg-muted/20">
										<TabsList className="w-full justify-start h-9 bg-transparent p-0 gap-2">
											<TabsTrigger
												value="flow"
												className="data-[state=active]:bg-background text-xs h-7 px-3"
											>
												<GitBranch className="mr-1.5 h-3 w-3" />
												Flow
											</TabsTrigger>
											<TabsTrigger
												value="context"
												className="data-[state=active]:bg-background text-xs h-7 px-3"
											>
												<BookOpen className="mr-1.5 h-3 w-3" />
												Context
											</TabsTrigger>
											<TabsTrigger
												value="notes"
												className="data-[state=active]:bg-background text-xs h-7 px-3"
											>
												<StickyNote className="mr-1.5 h-3 w-3" />
												Notes
											</TabsTrigger>
										</TabsList>
									</div>

									<TabsContent
										value="flow"
										className="flex-1 m-0 p-0 relative overflow-hidden"
									>
										<NodeGraph
											scenes={allScenes}
											activeSceneId={activeSceneId}
											onSceneSelect={setActiveSceneId}
											onBranchCreate={handleCreateBranch}
										/>
									</TabsContent>

									<TabsContent
										value="context"
										className="flex-1 m-0 overflow-y-auto p-4"
									>
										{/* Reuse BiblePane/TimelinePane logic but adapted for this view */}
										{/* Assuming they are self-contained or use context */}
										{/* Ideally we refactor these panes to accept props instead of relying on global context */}
										{/* For now, placeholder or wrap in context provider if needed */}
										<div className="space-y-6">
											<div className="space-y-2">
												<h3 className="font-semibold text-sm">Timeline</h3>
												<div className="h-40 border rounded-md bg-background/50 relative overflow-hidden">
													{/* Simplified timeline */}
													<div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
														Timeline View
													</div>
												</div>
											</div>
											<div className="space-y-2">
												<h3 className="font-semibold text-sm">Entities</h3>
												{/* List entities here */}
												<div className="text-xs text-muted-foreground italic">
													Character and location tracking coming soon to this
													panel.
												</div>
											</div>
										</div>
									</TabsContent>

									<TabsContent value="notes" className="flex-1 m-0 p-4">
										<textarea
											className="w-full h-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed"
											placeholder="Project scratchpad..."
										/>
									</TabsContent>
								</Tabs>
							</div>
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			{/* Floating Chat Assistant */}
			<FloatingChat
				id={`chat-${project.id}`} // Persistent chat ID for this project
				projectId={project.id}
				initialChatModel={DEFAULT_CHAT_MODEL}
				availableModels={availableModels}
			/>
		</div>
	);
}
