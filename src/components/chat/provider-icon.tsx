"use client";

import { cn } from "@/lib/utils";

type ProviderIconProps = {
	provider: string;
	className?: string;
	size?: "sm" | "md" | "lg";
};

const providerColors: Record<
	string,
	{ bg: string; text: string; border: string }
> = {
	openai: {
		bg: "bg-emerald-500/10",
		text: "text-emerald-600 dark:text-emerald-400",
		border: "border-emerald-500/20",
	},
	anthropic: {
		bg: "bg-orange-500/10",
		text: "text-orange-600 dark:text-orange-400",
		border: "border-orange-500/20",
	},
	google: {
		bg: "bg-blue-500/10",
		text: "text-blue-600 dark:text-blue-400",
		border: "border-blue-500/20",
	},
	meta: {
		bg: "bg-indigo-500/10",
		text: "text-indigo-600 dark:text-indigo-400",
		border: "border-indigo-500/20",
	},
	mistral: {
		bg: "bg-purple-500/10",
		text: "text-purple-600 dark:text-purple-400",
		border: "border-purple-500/20",
	},
	deepseek: {
		bg: "bg-cyan-500/10",
		text: "text-cyan-600 dark:text-cyan-400",
		border: "border-cyan-500/20",
	},
	xai: {
		bg: "bg-gray-500/10",
		text: "text-gray-600 dark:text-gray-400",
		border: "border-gray-500/20",
	},
	groq: {
		bg: "bg-rose-500/10",
		text: "text-rose-600 dark:text-rose-400",
		border: "border-rose-500/20",
	},
	cohere: {
		bg: "bg-violet-500/10",
		text: "text-violet-600 dark:text-violet-400",
		border: "border-violet-500/20",
	},
	default: {
		bg: "bg-muted",
		text: "text-muted-foreground",
		border: "border-muted-foreground/20",
	},
};

const providerLogos: Record<string, string> = {
	openai: "◐",
	anthropic: "◑",
	google: "◓",
	meta: "◒",
	mistral: "◈",
	deepseek: "◇",
	xai: "✕",
	groq: "⚡",
	cohere: "◎",
};

const sizeClasses = {
	sm: "h-4 w-4 text-[10px]",
	md: "h-5 w-5 text-xs",
	lg: "h-6 w-6 text-sm",
};

export function ProviderIcon({
	provider,
	className,
	size = "md",
}: ProviderIconProps) {
	const normalizedProvider = provider.toLowerCase();
	const colors = providerColors[normalizedProvider] || providerColors.default;
	const logo =
		providerLogos[normalizedProvider] || provider.charAt(0).toUpperCase();

	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-md border font-semibold",
				colors.bg,
				colors.text,
				colors.border,
				sizeClasses[size],
				className,
			)}
		>
			{logo}
		</div>
	);
}

export function getProviderColors(provider: string) {
	const normalizedProvider = provider.toLowerCase();
	return providerColors[normalizedProvider] || providerColors.default;
}

export function getProviderGradient(provider: string): string {
	const normalizedProvider = provider.toLowerCase();
	const gradients: Record<string, string> = {
		openai: "from-emerald-500/20 to-emerald-500/5",
		anthropic: "from-orange-500/20 to-orange-500/5",
		google: "from-blue-500/20 to-blue-500/5",
		meta: "from-indigo-500/20 to-indigo-500/5",
		mistral: "from-purple-500/20 to-purple-500/5",
		deepseek: "from-cyan-500/20 to-cyan-500/5",
		xai: "from-gray-500/20 to-gray-500/5",
		groq: "from-rose-500/20 to-rose-500/5",
		cohere: "from-violet-500/20 to-violet-500/5",
	};
	return gradients[normalizedProvider] || "from-muted/20 to-muted/5";
}
