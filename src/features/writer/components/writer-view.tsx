"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { memo, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { BookCanvas } from "@/components/organisms/book-canvas/book-canvas";
import { useBookCanvasActions } from "@/components/organisms/book-canvas/book-canvas-context";
import { useSceneNavigation } from "@/features/writer/components/hooks/use-scene-navigation";
import { useWriterLayout } from "@/features/writer/components/hooks/use-writer-layout";
import { PowerDock } from "@/features/writer/components/power-dock";
import { WriterSpotlight } from "@/features/writer/components/tools/writer-spotlight";
import { WriterProvider } from "@/features/writer/components/writer-context";
import {
	useWriterControl,
	WriterControlProvider,
} from "@/features/writer/components/writer-control-context";
import { WriterEditor } from "@/features/writer/components/writer-editor";
import { WriterLayoutContext } from "@/features/writer/components/writer-layout-context";
import { WriterSidebar } from "@/features/writer/components/writer-sidebar";
import { WriterSkeleton } from "@/features/writer/components/writer-skeleton";
import { springs } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { ChatModel } from "@/lib/ai/models";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

// Lazy load assistant
const FloatingAssistant = dynamic(() =>
	import("@/components/organisms/chat/floating-assistant").then(
		(mod) => mod.FloatingAssistant,
	),
);

interface WriterViewProps {
	project: Project;
	initialStructure?: ChapterWithScenes[];
	initialStructureText?: string;
	isReadOnly?: boolean;
	defaultModelId?: string;
	availableModels?: ChatModel[];
}

function WriterViewContent({
	project,
	availableModels,
	defaultModelId,
}: WriterViewProps) {
	const [mounted, setMounted] = useState(false);

	const {
		isSidebarOpen,
		isCanvasOpen,
		viewMode,
		isTypewriterMode,
		isDirectorMode,
		actions,
	} = useWriterLayout();

	const { isChatOpen, setChatOpen, toggleSpotlight } = useWriterControl();
	const { nextScene, prevScene } = useSceneNavigation();

	// Global Hotkeys
	useHotkeys(
		"meta+j, ctrl+j",
		(e) => {
			e.preventDefault();
			nextScene();
		},
		{ enableOnFormTags: true },
		[nextScene],
	);
	useHotkeys(
		"meta+k, ctrl+k",
		(e) => {
			e.preventDefault();
			prevScene();
		},
		{ enableOnFormTags: true },
		[prevScene],
	);
	useHotkeys(
		"meta+b, ctrl+b",
		(e) => {
			e.preventDefault();
			actions.toggleSidebar();
		},
		{ enableOnFormTags: true },
		[actions],
	);
	useHotkeys(
		"meta+/, ctrl+/",
		(e) => {
			e.preventDefault();
			toggleSpotlight();
		},
		{ enableOnFormTags: true },
		[toggleSpotlight],
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	const layoutContextValue = useMemo(
		() => ({
			isSidebarOpen,
			toggleSidebar: actions.toggleSidebar,
			isCanvasOpen,
			toggleCanvas: actions.toggleCanvas,
			viewMode,
			toggleZenMode: actions.toggleZenMode,
			isTypewriterMode,
			toggleTypewriterMode: actions.toggleTypewriterMode,
			isDirectorMode,
			toggleDirectorMode: actions.toggleDirectorMode,
		}),
		[
			isSidebarOpen,
			isCanvasOpen,
			viewMode,
			isTypewriterMode,
			isDirectorMode,
			actions,
		],
	);

	const isZen = viewMode === "zen";
	const { setIsOpen: setCanvasInternalOpen } = useBookCanvasActions();

	useEffect(() => {
		setCanvasInternalOpen(isCanvasOpen);
	}, [isCanvasOpen, setCanvasInternalOpen]);

	const editorPanel = useMemo(
		() => (
			<div className="relative z-10 h-full w-full">
				<WriterEditor />
				<PowerDock />
				<WriterSpotlight />
			</div>
		),
		[],
	);

	if (!mounted) {
		return <WriterSkeleton />;
	}

	// Layout matching skeleton: 20% sidebar | flex-1 editor | 30% canvas
	return (
		<WriterLayoutContext.Provider value={layoutContextValue}>
			<div className="flex h-full w-full overflow-hidden bg-muted/30 p-2 gap-2">
				<AnimatePresence mode="popLayout">
					{/* Left Panel: Sidebar (20%) - matches skeleton */}
					{!isZen && isSidebarOpen && (
						<motion.div
							initial={{ width: 0, opacity: 0, x: -20 }}
							animate={{ width: "20%", opacity: 1, x: 0 }}
							exit={{ width: 0, opacity: 0, x: -20 }}
							transition={springs.liquid}
							className="min-w-[250px] flex flex-col hidden md:flex rounded-2xl overflow-hidden glass-panel border bg-background/60 backdrop-blur-xl shadow-sm"
						>
							<WriterSidebar />
						</motion.div>
					)}
				</AnimatePresence>

				{/* Center Panel: Editor (flex-1) - matches skeleton */}
				<motion.div
					layout
					className="flex-1 flex flex-col min-w-0 relative rounded-2xl overflow-hidden glass-panel border bg-background/60 backdrop-blur-xl shadow-sm transition-all duration-300 ease-spring"
				>
					{editorPanel}
				</motion.div>

				<AnimatePresence mode="popLayout">
					{/* Right Panel: Canvas (30%) - matches skeleton */}
					{!isZen && isCanvasOpen && (
						<motion.div
							initial={{ width: 0, opacity: 0, x: 20 }}
							animate={{ width: "30%", opacity: 1, x: 0 }}
							exit={{ width: 0, opacity: 0, x: 20 }}
							transition={springs.liquid}
							className="min-w-[300px] hidden lg:flex flex-col rounded-2xl overflow-hidden glass-panel border bg-background/60 backdrop-blur-xl shadow-sm"
						>
							<BookCanvas variant="embedded" />
						</motion.div>
					)}
				</AnimatePresence>

				<FloatingAssistant
					projectId={project.id}
					defaultModelId={defaultModelId}
					availableModels={availableModels}
					isOpen={isChatOpen}
					onOpenChange={setChatOpen}
					hideTrigger={true}
				/>
			</div>
		</WriterLayoutContext.Provider>
	);
}

const CanvasSync = memo(function CanvasSync({
	projectId,
	isReadOnly,
}: {
	projectId: string;
	isReadOnly: boolean;
}) {
	const { setProjectId, setIsReadOnly } = useBookCanvasActions();

	useEffect(() => {
		setProjectId(projectId);
		setIsReadOnly(isReadOnly);
		return () => {
			setProjectId(null);
			setIsReadOnly(false);
		};
	}, [projectId, isReadOnly, setProjectId, setIsReadOnly]);

	return null;
});

export function WriterView(props: WriterViewProps) {
	const { project, isReadOnly = false } = props;

	return (
		<div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-background">
			<WriterProvider {...props}>
				<WriterControlProvider>
					<CanvasSync projectId={project.id} isReadOnly={isReadOnly} />
					<WriterViewContent {...props} />
				</WriterControlProvider>
			</WriterProvider>
		</div>
	);
}
