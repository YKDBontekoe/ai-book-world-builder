"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Check,
	CheckCircle2,
	ChevronDown,
	Clock,
	Coins,
	Loader2,
	Pause,
	Play,
	RefreshCw,
	StopCircle,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	cancelBookGeneration,
	getGenerationStatus,
	pauseBookGeneration,
    approveChapterAction,
    rejectChapterAction,
} from "@/app/actions/ai-operations";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { Textarea } from "@/components/atoms/textarea";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/atoms/dialog";
import type { PipelineStatus } from "@/lib/ai/services/pipeline-types";
import { cn } from "@/lib/utils";

interface GenerationDashboardProps {
	generationId: string;
	projectId: string;
	onComplete?: () => void;
	onClose?: () => void;
}

interface LogEntry {
	id: string;
	timestamp: Date;
	type: "info" | "success" | "warning" | "error";
	message: string;
}

export function GenerationDashboard({
	generationId,
	projectId,
	onComplete,
	onClose,
}: GenerationDashboardProps) {
	const [status, setStatus] = useState<PipelineStatus | null>(null);
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [isPolling, setIsPolling] = useState(true);
	const [isPausing, setIsPausing] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [showLogs, setShowLogs] = useState(true);
    
    // Approval State
    const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
    const [rejectionNote, setRejectionNote] = useState("");
    const [isProcessingAction, setIsProcessingAction] = useState(false);

	const logEndRef = useRef<HTMLDivElement>(null);
	const mounted = useRef(false);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	// Add log entry
	const addLog = useCallback((type: LogEntry["type"], message: string) => {
		if (!mounted.current) return;
		setLogs((prev) => [
			...prev,
			{
				id: `${Date.now()}-${Math.random()}`,
				timestamp: new Date(),
				type,
				message,
			},
		]);
	}, []);

	// Poll for status updates
	useEffect(() => {
		if (!isPolling) return;

		let intervalId: NodeJS.Timeout;

		const poll = async () => {
			if (!mounted.current) {
				clearInterval(intervalId);
				return;
			}
			try {
				const result = await getGenerationStatus(generationId);
				if (!mounted.current) return;

				if (result.success && result.status) {
					const newStatus = result.status as PipelineStatus;

					// Check for status changes
					if (status?.status !== newStatus.status) {
						if (newStatus.status === "completed") {
							addLog("success", "Generation completed successfully!");
							if (onComplete) onComplete();
						} else if (newStatus.status === "failed") {
							addLog("error", newStatus.error || "Generation failed");
						} else if (newStatus.status === "paused") {
							addLog("info", "Generation paused");
						}
					}

					// Check for step changes
					if (
						status?.currentStep?.id !== newStatus.currentStep?.id &&
						newStatus.currentStep
					) {
						addLog("info", `Starting: ${newStatus.currentStep.name}`);
					}

					if (mounted.current) setStatus(newStatus);

					// Stop polling if completed, failed, or paused
					if (["completed", "failed"].includes(newStatus.status)) {
						if (mounted.current) setIsPolling(false);
					}
				}
			} catch (error) {
				console.error("Failed to get status:", error);
			}
		};

		// Initial poll
		poll();
		// Set up interval
		intervalId = setInterval(poll, 2000);

		return () => {
			clearInterval(intervalId);
		};
	}, [
		generationId,
		isPolling,
		status?.status,
		status?.currentStep?.id,
		addLog,
		onComplete,
	]);

	// Scroll logs to bottom
	useEffect(() => {
		logEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [logs]);

	const handlePause = async () => {
		setIsPausing(true);
		try {
			const result = await pauseBookGeneration(generationId);
			if (result.success) {
				toast.success("Generation paused");
				addLog("info", "Generation paused by user");
			} else {
				toast.error("Failed to pause");
			}
		} catch (error) {
			toast.error("Failed to pause generation");
		} finally {
			setIsPausing(false);
		}
	};

	const handleResume = async () => {
		addLog("info", "Resuming generation...");
		setIsProcessingAction(true);
		try {
			const result = await approveChapterAction(generationId);
			if (result.success) {
				toast.success("Resuming pipeline...");
				setIsPolling(true); // Start polling again
			} else {
				toast.error(result.error || "Failed to resume.");
				addLog("error", result.error || "Failed to resume pipeline.");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred.";
			toast.error(`Failed to resume: ${errorMessage}`);
			addLog("error", `Failed to resume: ${errorMessage}`);
		} finally {
			if (mounted.current) {
				setIsProcessingAction(false);
			}
		}
	};

	const handleCancel = async () => {
		setIsCancelling(true);
		try {
			const result = await cancelBookGeneration(generationId);
			if (result.success) {
				toast.success("Generation cancelled");
				addLog("warning", "Generation cancelled by user");
				setIsPolling(false);
			} else {
				toast.error("Failed to cancel");
			}
		} catch (error) {
			toast.error("Failed to cancel generation");
		} finally {
			setIsCancelling(false);
		}
	};

    const handleApprove = async () => {
        setIsProcessingAction(true);
        try {
            const result = await approveChapterAction(generationId);
            if (result.success) {
                toast.success("Approved. Resuming pipeline...");
                addLog("success", "User approved chapter. Resuming...");
                // Refresh status immediately
                const statusRes = await getGenerationStatus(generationId);
                if (statusRes.success && statusRes.status) {
                    setStatus(statusRes.status as PipelineStatus);
                }
            } else {
                toast.error("Failed to approve");
            }
        } catch (error) {
            toast.error("Failed to approve generation");
        } finally {
            setIsProcessingAction(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionNote.trim()) {
            toast.error("Please provide instructions for revision.");
            return;
        }

        // Need current step ID to reject. Use status.currentStep?.id
        // If status is awaiting_approval, currentStep should be the paused one.
        if (!status?.currentStep?.id) {
            toast.error("No active step to reject");
            return;
        }
        
        setIsProcessingAction(true);
        try {
            const result = await rejectChapterAction(generationId, status.currentStep.id, rejectionNote);
            if (result.success) {
                toast.success("Rejected. Queuing revision...");
                addLog("warning", "User rejected chapter. Queuing revision...");
                setIsRejectionDialogOpen(false);
                setRejectionNote("");
                
                // Refresh status
                const statusRes = await getGenerationStatus(generationId);
                if (statusRes.success && statusRes.status) {
                    setStatus(statusRes.status as PipelineStatus);
                }
            } else {
                toast.error("Failed to reject");
            }
        } catch (error) {
            toast.error("Failed to reject generation");
        } finally {
            setIsProcessingAction(false);
        }
    };

	const formatDuration = (seconds: number) => {
		if (seconds < 60) return `${seconds}s`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	};

	const getStatusColor = () => {
		switch (status?.status) {
			case "running":
				return "text-blue-500";
			case "paused":
				return "text-amber-500";
            case "awaiting_approval":
                return "text-orange-500";
			case "completed":
				return "text-green-500";
			case "failed":
				return "text-red-500";
			default:
				return "text-muted-foreground";
		}
	};

	const getStatusIcon = () => {
		switch (status?.status) {
			case "running":
				return <Loader2 className="w-5 h-5 animate-spin" />;
			case "paused":
				return <Pause className="w-5 h-5" />;
            case "awaiting_approval":
                return <AlertCircle className="w-5 h-5" />;
			case "completed":
				return <CheckCircle2 className="w-5 h-5" />;
			case "failed":
				return <AlertCircle className="w-5 h-5" />;
			default:
				return <Clock className="w-5 h-5" />;
		}
	};

	if (!status) {
		return (
			<Card className="p-8 flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</Card>
		);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className={cn("flex items-center gap-2", getStatusColor())}>
						{getStatusIcon()}
						<span className="font-semibold capitalize">
							{status.status}
						</span>
					</div>
					{status.currentStep && status.status === "running" && (
						<span className="text-sm text-muted-foreground">
							• {status.currentStep.name}
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{status.status === "running" && (
						<Button
							variant="outline"
							size="sm"
							onClick={handlePause}
							disabled={isPausing}
						>
							{isPausing ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Pause className="w-4 h-4" />
							)}
							<span className="ml-2">Pause</span>
						</Button>
					)}
					{status.status === "paused" && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleResume}
							disabled={isProcessingAction}
						>
							{isProcessingAction ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Play className="w-4 h-4" />
							)}
							<span className="ml-2">Resume</span>
						</Button>
					)}
                    {status.status === "awaiting_approval" && (
                        <>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsRejectionDialogOpen(true)}
                                disabled={isProcessingAction}
                                className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                                <X className="w-4 h-4" />
                                <span className="ml-2">Reject</span>
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={handleApprove}
                                disabled={isProcessingAction}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isProcessingAction ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                <span className="ml-2">Approve</span>
                            </Button>
                        </>
                    )}
					{["running", "paused"].includes(status.status) && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleCancel}
							disabled={isCancelling}
							className="text-destructive hover:text-destructive"
						>
							{isCancelling ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<StopCircle className="w-4 h-4" />
							)}
							<span className="ml-2">Cancel</span>
						</Button>
					)}
					{["completed", "failed"].includes(status.status) && onClose && (
						<Button variant="outline" size="sm" onClick={onClose}>
							<X className="w-4 h-4" />
							<span className="ml-2">Close</span>
						</Button>
					)}
				</div>
			</div>

			{/* Progress */}
			<Card className="p-4 mb-4">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium">Progress</span>
					<span className="text-sm font-bold">{status.progress}%</span>
				</div>
				<Progress value={status.progress} className="h-3" />
				<div className="flex justify-between text-xs text-muted-foreground mt-2">
					<span>
						{status.steps.completed}/{status.steps.total} steps
					</span>
					{status.steps.failed > 0 && (
						<span className="text-destructive">
							{status.steps.failed} failed
						</span>
					)}
				</div>
			</Card>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-4 mb-4">
				<Card className="p-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
						<Clock className="w-4 h-4" />
						Duration
					</div>
					<div className="text-lg font-bold">
						{status.startedAt
							? formatDuration(
									Math.floor(
										(Date.now() - new Date(status.startedAt).getTime()) /
											1000,
									),
								)
							: "--"}
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
						<RefreshCw className="w-4 h-4" />
						Words
					</div>
					<div className="text-lg font-bold">
						{status.totals.wordsGenerated.toLocaleString()}
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
						<Coins className="w-4 h-4" />
						Est. Cost
					</div>
					<div className="text-lg font-bold">
						${status.totals.estimatedCostUsd.toFixed(2)}
					</div>
				</Card>
			</div>

			{/* Logs */}
			<div className="flex-1 flex flex-col min-h-0">
				<button
					type="button"
					className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-t-lg"
					onClick={() => setShowLogs(!showLogs)}
				>
					<span className="text-sm font-medium">Activity Log</span>
					<ChevronDown
						className={cn(
							"w-4 h-4 transition-transform",
							showLogs && "rotate-180",
						)}
					/>
				</button>
				<AnimatePresence>
					{showLogs && (
						<motion.div
							initial={{ height: 0 }}
							animate={{ height: "auto" }}
							exit={{ height: 0 }}
							className="overflow-hidden"
						>
							<ScrollArea className="h-48 border rounded-b-lg bg-muted/20">
								<div className="p-3 space-y-1 font-mono text-xs">
									{logs.map((log) => (
										<div
											key={log.id}
											className={cn(
												"flex gap-2",
												log.type === "error" && "text-red-500",
												log.type === "success" && "text-green-500",
												log.type === "warning" && "text-amber-500",
												log.type === "info" && "text-muted-foreground",
											)}
										>
											<span className="opacity-50">
												{log.timestamp.toLocaleTimeString()}
											</span>
											<span className="font-medium">
												{log.type === "success" && (
													<Check className="w-3 h-3 inline mr-1" />
												)}
												{log.type === "error" && (
													<X className="w-3 h-3 inline mr-1" />
												)}
												{log.message}
											</span>
										</div>
									))}
									<div ref={logEndRef} />
								</div>
							</ScrollArea>
						</motion.div>
					)}
				</AnimatePresence>
			</div>


        <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject & Revise</DialogTitle>
                    <DialogDescription>
                        Provide instructions for the AI to revise this chapter.
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    placeholder="E.g., The pacing is too slow, and character motivations are unclear..."
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    className="min-h-[100px]"
                />
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsRejectionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleReject} disabled={isProcessingAction}>
                        {isProcessingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Request Revision
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </div>
	);
}
