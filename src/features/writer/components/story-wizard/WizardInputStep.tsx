"use client";

import { motion } from "framer-motion";
import { Info, Sparkles, Wand2 } from "lucide-react";
import type React from "react";
import type { JSX } from "react";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Textarea } from "@/components/atoms/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import type { StoryStyle } from "@/lib/services/schemas/story-schemas";
import type { StoryTemplate } from "@/lib/story-templates";

interface WizardInputStepProps {
	templates: StoryTemplate[];
	prompt: string;
	style: StoryStyle;
	onPromptChange: (value: string) => void;
	onStyleChange: (style: StoryStyle) => void;
	onApplyTemplate: (template: StoryTemplate) => void;
	onGenerate: () => void;
}

export function WizardInputStep({
	templates,
	prompt,
	style,
	onPromptChange,
	onStyleChange,
	onApplyTemplate,
	onGenerate,
}: WizardInputStepProps): JSX.Element {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="w-full max-w-2xl space-y-6 pt-4 md:pt-0"
			key="input"
		>
			<div className="text-center space-y-2">
				<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
					<Wand2 className="w-6 h-6 text-primary" />
				</div>
				<h2 className="text-2xl font-bold tracking-tight">Generate Your Story</h2>
				<p className="text-muted-foreground">
					Choose a template to get started quickly, or describe your own idea.
				</p>
			</div>

			{/* Templates Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
				{templates.map((template) => (
					<button
						key={template.label}
						type="button"
						onClick={() => onApplyTemplate(template)}
						className="flex flex-col items-start p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all text-left group h-full"
					>
						<div className="mb-2 p-2 rounded-md bg-background shadow-sm text-primary group-hover:scale-105 transition-transform">
							<template.icon className="w-4 h-4" />
						</div>
						<div className="font-medium text-sm mb-1">{template.label}</div>
						<div className="text-xs text-muted-foreground line-clamp-2">
							{template.description}
						</div>
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="space-y-2">
					<Label>Genre</Label>
					<Select
						value={style.genre}
						onValueChange={(v) => onStyleChange({ ...style, genre: v })}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Fantasy">Fantasy</SelectItem>
							<SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
							<SelectItem value="Mystery">Mystery</SelectItem>
							<SelectItem value="Thriller">Thriller</SelectItem>
							<SelectItem value="Romance">Romance</SelectItem>
							<SelectItem value="General Fiction">General Fiction</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Label>POV</Label>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										aria-label="POV information"
									>
										<Info className="w-3 h-3 text-muted-foreground cursor-help" />
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">
										Determines the narrator's perspective (e.g., First Person "I",
										Third Person "He/She").
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<Select
						value={style.pov}
						onValueChange={(v) => onStyleChange({ ...style, pov: v })}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="First Person">First Person</SelectItem>
							<SelectItem value="Third Person Limited">
								Third Person Limited
							</SelectItem>
							<SelectItem value="Third Person Omniscient">
								Third Person Omniscient
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Label>Tone</Label>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										aria-label="Tone information"
									>
										<Info className="w-3 h-3 text-muted-foreground cursor-help" />
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p className="max-w-xs">
										Sets the mood and atmosphere of the writing (e.g., Dark,
										Humorous, Epic).
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<Select
						value={style.tone}
						onValueChange={(v) => onStyleChange({ ...style, tone: v })}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Neutral">Neutral</SelectItem>
							<SelectItem value="Dark">Dark</SelectItem>
							<SelectItem value="Humorous">Humorous</SelectItem>
							<SelectItem value="Epic">Epic</SelectItem>
							<SelectItem value="Intimate">Intimate</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="relative">
				<Textarea
					value={prompt}
					onChange={(e) => onPromptChange(e.target.value)}
					placeholder="e.g. A cyberpunk detective story set on Mars where water is more valuable than gold..."
					className="min-h-[160px] text-lg p-4 resize-none glass-input"
					autoFocus
				/>
				<Button
					className="absolute bottom-4 right-4"
					onClick={onGenerate}
					disabled={!prompt.trim()}
				>
					<Sparkles className="w-4 h-4 mr-2" />
					Generate Plan
				</Button>
			</div>
		</motion.div>
	);
}
