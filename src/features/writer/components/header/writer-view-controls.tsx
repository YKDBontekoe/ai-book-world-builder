"use client";

import {
	Activity,
	AlignVerticalJustifyCenter,
	Maximize2,
	Minimize2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/atoms/tooltip";

interface WriterViewControlsProps {
	isDirectorMode: boolean;
	toggleDirectorMode: () => void;
	isTypewriterMode: boolean;
	toggleTypewriterMode: () => void;
	isZenMode: boolean;
	toggleZenMode: () => void;
}

export function WriterViewControls({
	isDirectorMode,
	toggleDirectorMode,
	isTypewriterMode,
	toggleTypewriterMode,
	isZenMode,
	toggleZenMode,
}: WriterViewControlsProps) {
	return (
		<div className="flex items-center gap-1.5">
			{/* View Modes Group */}
			<div className="flex items-center p-1 bg-muted/40 rounded-lg border border-border/40">
				<ControlToggle
					isActive={isDirectorMode}
					onClick={toggleDirectorMode}
					label="Director Mode"
					icon={<Activity className="h-4 w-4" />}
				/>
				<ControlToggle
					isActive={isTypewriterMode}
					onClick={toggleTypewriterMode}
					label="Typewriter Mode"
					icon={<AlignVerticalJustifyCenter className="h-4 w-4" />}
				/>
			</div>

			<div className="h-4 w-px bg-border/40 mx-0.5" />

			{/* Zen Mode */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"h-8 w-8 transition-all duration-300 rounded-lg",
							isZenMode
								? "text-primary hover:text-primary hover:bg-primary/10"
								: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
						)}
						onClick={toggleZenMode}
					>
						{isZenMode ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs font-medium">
					{isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
				</TooltipContent>
			</Tooltip>
		</div>
	);
}

interface ControlToggleProps {
	isActive: boolean;
	onClick: () => void;
	label: string;
	icon: React.ReactNode;
}

function ControlToggle({ isActive, onClick, label, icon }: ControlToggleProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={onClick}
					aria-label={label}
					className={cn(
						"relative flex items-center justify-center h-7 w-7 rounded-md transition-colors duration-200",
						isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
					)}
				>
					{isActive && (
						<motion.div
							layoutId="view-control-active"
							className="absolute inset-0 bg-background shadow-sm rounded-md ring-1 ring-black/5 dark:ring-white/10"
							initial={false}
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
						/>
					)}
					<span className="relative z-10">{icon}</span>
				</button>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="text-xs font-medium">
				{label}
			</TooltipContent>
		</Tooltip>
	);
}
