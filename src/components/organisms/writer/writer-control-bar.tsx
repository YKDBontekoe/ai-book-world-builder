"use client";

import { motion } from "framer-motion";
import { MessageSquare, Redo, Search, Sparkles, Undo } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/atoms/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { GlassCard } from "@/components/molecules/glass-card";
import { AIToolsMenu } from "@/components/organisms/writer/tools/ai-tools-menu";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { cn } from "@/lib/utils";

export function WriterControlBar() {
	const {
		editorActions,
		toggleChat,
		isChatOpen,
		toggleSpotlight,
		isSpotlightOpen,
	} = useWriterControl();

	const { viewMode } = useWriterLayoutContext();
	const isZen = viewMode === "zen";
	const [isToolsOpen, setIsToolsOpen] = useState(false);

	// Animation variants
	const containerVariants = {
		hidden: { y: 100, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: "spring",
				stiffness: 300,
				damping: 30,
			},
		},
		zen: {
			y: 0,
			opacity: 0, // Hidden by default in Zen
		},
	};

	return (
		<TooltipProvider>
			<motion.div
				className={cn(
					"absolute bottom-8 left-1/2 -translate-x-1/2 z-50",
					isZen && "hover:opacity-100 transition-opacity duration-300",
				)}
				initial="hidden"
				animate={isZen ? "zen" : "visible"}
				variants={containerVariants}
			>
				<GlassCard
					variant="liquid"
					className="p-2 rounded-2xl shadow-2xl border-white/20 backdrop-blur-xl"
				>
					<div className="flex items-center gap-1">
						{/* Editor Actions */}
						<ControlGroup>
							<ControlButton
								label="Undo"
								icon={Undo}
								onClick={() => editorActions?.undo()}
								disabled={!editorActions}
								shortcut="⌘Z"
							/>
							<ControlButton
								label="Redo"
								icon={Redo}
								onClick={() => editorActions?.redo()}
								disabled={!editorActions}
								shortcut="⌘⇧Z"
							/>
						</ControlGroup>

						<Separator
							orientation="vertical"
							className="h-6 mx-1 bg-white/10"
						/>
						<ControlButton
							label="AI Tools"
							icon={Sparkles}
							onClick={() => setIsToolsOpen(true)}
							active={isToolsOpen}
						/>
					</ControlGroup>

						{/* Quick Tools */}
						<ControlGroup>
							<ControlButton
								label="Spotlight"
								icon={Search}
								onClick={toggleSpotlight}
								active={isSpotlightOpen}
								shortcut="⌘K"
							/>
							<ControlButton
								label="AI Tools"
								icon={Sparkles}
								onClick={() => {}} // To implement: Open tools menu
							/>
						</ControlGroup>

						<Separator
							orientation="vertical"
							className="h-6 mx-1 bg-white/10"
						/>

						{/* Assistant */}
						<ControlGroup>
							<ControlButton
								label="Assistant"
								icon={MessageSquare}
								onClick={toggleChat}
								active={isChatOpen}
								shortcut="⌘J"
							/>
						</ControlGroup>
					</div>
				</GlassCard>
			</motion.div>

			<AIToolsMenu isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
		</TooltipProvider>
	);
}

function ControlGroup({ children }: { children: React.ReactNode }) {
	return <div className="flex items-center gap-1">{children}</div>;
}

interface ControlButtonProps {
	label: string;
	icon: React.ElementType;
	onClick: () => void;
	active?: boolean;
	disabled?: boolean;
	shortcut?: string;
}

function ControlButton({
	label,
	icon: Icon,
	onClick,
	active,
	disabled,
	shortcut,
}: ControlButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={onClick}
					disabled={disabled}
					className={cn(
						"relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
						"hover:bg-white/10 hover:scale-110 active:scale-95",
						active &&
							"bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]",
						disabled &&
							"opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
						!active &&
							!disabled &&
							"text-muted-foreground hover:text-foreground",
					)}
				>
					<Icon className="w-5 h-5" />
					{active && (
						<motion.div
							layoutId="active-dot"
							className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
						/>
					)}
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" className="flex items-center gap-2">
				<span>{label}</span>
				{shortcut && (
					<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-muted-foreground">
						{shortcut}
					</kbd>
				)}
			</TooltipContent>
		</Tooltip>
	);
}
