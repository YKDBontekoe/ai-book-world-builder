"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
	content: string;
	className?: string;
	size?: "sm" | "md" | "lg";
	showToast?: boolean;
	toastMessage?: string;
	variant?: "ghost" | "outline" | "default";
}

export function CopyButton({
	content,
	className,
	size = "sm",
	showToast = true,
	toastMessage = "Copied to clipboard",
	variant = "ghost",
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(content);
			setCopied(true);

			if (showToast) {
				toast.success(toastMessage);
			}

			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
			toast.error("Failed to copy to clipboard");
		}
	};

	const iconSize = size === "sm" ? 14 : size === "md" ? 16 : 18;

	return (
		<Button
			variant={variant}
			size={size === "sm" ? "icon" : size === "md" ? "sm" : "default"}
			onClick={handleCopy}
			className={cn(
				"relative transition-all duration-200",
				size === "sm" && "h-7 w-7",
				className,
			)}
			title="Copy to clipboard"
			type="button"
		>
			<AnimatePresence mode="wait" initial={false}>
				{copied ? (
					<motion.div
						key="check"
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, rotate: 180 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
					>
						<CheckIcon size={iconSize} className="text-green-500" />
					</motion.div>
				) : (
					<motion.div
						key="copy"
						initial={{ scale: 0, rotate: 180 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, rotate: -180 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
					>
						<CopyIcon size={iconSize} />
					</motion.div>
				)}
			</AnimatePresence>
		</Button>
	);
}
