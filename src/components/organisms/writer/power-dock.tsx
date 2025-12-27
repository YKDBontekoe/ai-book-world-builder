"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Redo,
    Search,
    Sparkles,
    Undo,
    X,
    Send,
    ChevronDown,
    Feather,
    Edit,
    Expand,
    BookOpenCheck,
    AlertTriangle,
    Globe,
    GraduationCap,
    AudioLines,
} from "lucide-react";
import { VoiceProfileModal } from "@/components/organisms/writer/tools/voice-profile-modal";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/atoms/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterControl } from "@/components/organisms/writer/writer-control-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/atoms/textarea";
import { ToolType, toolStrategies } from "@/components/organisms/writer/tools/tool-strategies";

// Tool Configuration
const TOOLS = [
    { id: 'write', icon: Feather, label: 'Batch Write', color: 'text-purple-400' },
    { id: 'rewrite', icon: Edit, label: 'Rewrite', color: 'text-blue-400' },
    { id: 'expand', icon: Expand, label: 'Expand', color: 'text-green-400' },
    { id: 'critique', icon: BookOpenCheck, label: 'Critique', color: 'text-yellow-400' },
    { id: 'consistency', icon: AlertTriangle, label: 'Fix', color: 'text-orange-400' },
    { id: 'lore', icon: Globe, label: 'Lore', color: 'text-pink-400' },
    { id: 'coach', icon: GraduationCap, label: 'Coach', color: 'text-indigo-400' },
    { id: 'voice', icon: AudioLines, label: 'Voice Profile', color: 'text-pink-400' },
] as const;

export function PowerDock() {
	const {
		editorActions,
		toggleChat,
		isChatOpen,
		toggleSpotlight,
		isSpotlightOpen,
        mode, setMode, // mode and setMode now come from useWriterControl
	} = useWriterControl();

    const { project, structure, activeChapterId, activeSceneId, sceneContent } = useWriterContext();
	const { viewMode } = useWriterLayoutContext();
	const isZen = viewMode === "zen";

    // Dock States
    const [selectedTool, setSelectedTool] = useState<typeof TOOLS[number] | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    // Reset when closing or changing modes
    const reset = () => {
        setMode('default');
        setSelectedTool(null);
        setInput("");
        setResult(null);
        setIsProcessing(false);
    };

    const handleToolSelect = (tool: typeof TOOLS[number]) => {
        if (tool.id === 'voice') {
            setIsVoiceModalOpen(true);
            return;
        }

        setSelectedTool(tool);
        if (mode !== 'input') {
            setMode('input');
        }
        setResult(null); // This was likely intended to be here
    };

    const handleExecute = async () => {
		if (!project?.id || !selectedTool) return;
		setIsProcessing(true);
		setResult(null);

		try {
			const strategy = toolStrategies[selectedTool.id];
			if (!strategy) {
				toast.error("Tool not implemented yet.");
				return;
			}

			const toolContext = {
				project,
				structure: structure ?? [],
				activeChapterId: activeChapterId || null,
				activeSceneId: activeSceneId || null,
				content: sceneContent,
			};

			const outcome = await strategy.execute(toolContext, input);

			if (outcome.success) {
				if (outcome.result) {
					setResult(outcome.result);
                    toast.success("Action completed");
				} else {
                    // If no result text (e.g. direct edit), close the dock
					reset();
                    toast.success("Action completed");
				}
			} else {
				toast.error("Operation failed. Please try again.");
			}
		} catch (e) {
			toast.error("Operation failed.");
            console.error(e);
		} finally {
			setIsProcessing(false);
		}
	};

    const getPlaceholder = (tool: typeof TOOLS[number]) => { // Update type to typeof TOOLS[number]
        switch (tool.id) { // Access tool.id
            case "write": return "Instructions (e.g., 'Make it tense')";
            case "rewrite": return "Instructions (e.g., 'Change to 1st person')";
            case "expand": return "Paste notes or outline...";
            case "critique": return "Specific questions? (Optional)";
            case "lore": return "Describe the entity...";
            case "coach": return "Any specific focus?";

            case "voice": return "Describe the voice you want to create..."; // Added for voice tool
            default: return "Enter instructions...";
        }
    };

	// Animation variants
	const containerVariants = {
		hidden: { y: 100, opacity: 0 },
		visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        zen: { y: 100, opacity: 0 }
	};

	return (
		<TooltipProvider>
			<motion.div
				className={cn(
					"fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2",
                    "w-auto max-w-[90vw]"
				)}
				initial="hidden"
				animate={isZen ? "zen" : "visible"}
				variants={containerVariants}
			>
                {/* Result Popover (if any) */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="mb-2 w-[500px] max-w-full"
                        >
                            <GlassCard variant="liquid" className="p-4 rounded-xl border-white/20 relative">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Result</span>
                                    <button onClick={() => setResult(null)} className="hover:bg-white/10 p-1 rounded">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="max-h-60 overflow-y-auto text-sm font-mono bg-black/20 p-2 rounded">
                                    {result}
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => {
                                            if (editorActions?.insertText && result) {
                                                editorActions.insertText(result);
                                                reset();
                                                toast.success("Text inserted into editor");
                                            }
                                        }}
                                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        Insert into Editor
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (result) {
                                                navigator.clipboard.writeText(result);
                                                toast.success("Copied to clipboard");
                                            }
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

				<GlassCard
					variant="liquid"
					className={cn(
                        "rounded-2xl shadow-2xl border-white/20 backdrop-blur-xl transition-all duration-500 ease-spring overflow-hidden",
                        // Dynamic sizing based on mode
                        mode === 'default' ? "p-2" : "p-3",
						"border-primary/10"
                    )}
				>
                    <div className="flex items-center gap-1">

                        {/* MAIN BAR: Always Visible (unless in input mode, maybe shift?) */}
                        <AnimatePresence mode="popLayout">
                            {mode !== 'input' && (
                                <motion.div
                                    className="flex items-center gap-1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, width: 0 }}
                                >
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

                                    <Separator orientation="vertical" className="h-6 mx-1 bg-white/10" />

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
                                            onClick={() => setMode(mode === 'tools' ? 'default' : 'tools')}
                                            active={mode === 'tools'}
                                            className={cn(mode === 'tools' && "bg-primary text-primary-foreground hover:bg-primary/90")}
                                        />
                                    </ControlGroup>

                                    <Separator orientation="vertical" className="h-6 mx-1 bg-white/10" />

                                    <ControlGroup>
                                        <ControlButton
                                            label="Assistant"
                                            icon={MessageSquare}
                                            onClick={toggleChat}
                                            active={isChatOpen}
                                            shortcut="⌘J"
                                        />
                                    </ControlGroup>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* AI TOOLS TRAY */}
                        <AnimatePresence mode="popLayout">
                            {mode === 'tools' && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex items-center gap-1 overflow-hidden pl-2 border-l border-white/10 ml-1"
                                >
                                    {TOOLS.map((tool) => (
                                        <ControlButton
                                            key={tool.id}
                                            label={tool.label}
                                            icon={tool.icon}
                                            onClick={() => handleToolSelect(tool)} // Pass the whole tool object
                                            className={tool.color}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* INPUT MODE */}
                        <AnimatePresence mode="popLayout">
                            {mode === 'input' && selectedTool && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex items-center gap-2 px-1 min-w-[300px] md:min-w-[400px]"
                                >
                                    <div className="flex items-center gap-2 mr-2 text-muted-foreground">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold uppercase">{selectedTool.label}</span> {/* Access selectedTool.label */}
                                    </div>

                                    <div className="flex-1 relative group">
                                        <Textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={getPlaceholder(selectedTool)}
                                            className="min-h-[36px] max-h-[100px] py-2 px-3 pr-10 resize-none bg-white/5 border-white/10 focus:border-primary/50 text-sm rounded-lg w-full"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleExecute();
                                                }
                                                if (e.key === 'Escape') {
                                                    reset();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={handleExecute}
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

                                    <Separator orientation="vertical" className="h-6 mx-1 bg-white/10" />

                                    <button
                                        onClick={reset}
                                        className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
				</GlassCard>
                <VoiceProfileModal 
                    open={isVoiceModalOpen} 
                    onOpenChange={setIsVoiceModalOpen} 
                />
			</motion.div>
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
    className?: string;
}

function ControlButton({
	label,
	icon: Icon,
	onClick,
	active,
	disabled,
	shortcut,
    className
}: ControlButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={label}
					onClick={onClick}
					disabled={disabled}
					className={cn(
						"relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
						"hover:bg-white/10 hover:scale-105 active:scale-95",
						active &&
							"bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]",
						disabled &&
							"opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
						!active &&
							!disabled &&
							"text-muted-foreground hover:text-foreground",
                        className
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
