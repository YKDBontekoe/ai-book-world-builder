"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Slider } from "@/components/atoms/slider";

export interface ReaderSettings {
	fontSize: number;
	fontFamily: string;
	theme: "light" | "dark" | "sepia";
	lineHeight: number;
}

interface ReaderControlsProps {
	isVisible: boolean;
	onClose: () => void;
	settings: ReaderSettings;
	onSettingsChange: (settings: ReaderSettings) => void;
	currentChapterTitle: string;
	onPreviousChapter: () => void;
	onNextChapter: () => void;
	hasPreviousChapter: boolean;
	hasNextChapter: boolean;
}

export function ReaderControls({
	isVisible,
	onClose,
	settings,
	onSettingsChange,
	currentChapterTitle,
	onPreviousChapter,
	onNextChapter,
	hasPreviousChapter,
	hasNextChapter,
}: ReaderControlsProps) {
	const router = useRouter();

	const updateSetting = <K extends keyof ReaderSettings>(
		key: K,
		value: ReaderSettings[K],
	) => {
		onSettingsChange({ ...settings, [key]: value });
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<>
					{/* Top Bar */}
					<motion.div
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -50 }}
						className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b p-4 flex items-center justify-between"
					>
						<Button variant="ghost" size="icon" onClick={() => router.back()}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<h2 className="font-semibold text-sm truncate max-w-[200px]">
							{currentChapterTitle}
						</h2>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-5 w-5" />
						</Button>
					</motion.div>

					{/* Bottom Bar (Settings) */}
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 50 }}
						className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t p-6 pb-8 space-y-6"
					>
						{/* Navigation (Mobile mostly) */}
						<div className="flex items-center justify-between lg:hidden mb-4">
							<Button
								variant="outline"
								onClick={onPreviousChapter}
								disabled={!hasPreviousChapter}
							>
								<ArrowLeft className="h-4 w-4 mr-2" /> Prev
							</Button>
							<Button
								variant="outline"
								onClick={onNextChapter}
								disabled={!hasNextChapter}
							>
								Next <ArrowRight className="h-4 w-4 ml-2" />
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Font Size</span>
									<span className="text-xs text-muted-foreground">
										{settings.fontSize}px
									</span>
								</div>
								<Slider
									min={12}
									max={32}
									step={1}
									value={[settings.fontSize]}
									onValueChange={(vals) => updateSetting("fontSize", vals[0])}
								/>
							</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Theme</span>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => updateSetting("theme", "light")}
										className={`flex-1 h-10 rounded-md border bg-white text-black ${settings.theme === "light" ? "ring-2 ring-primary" : ""}`}
									>
										Aa
									</button>
									<button
										onClick={() => updateSetting("theme", "sepia")}
										className={`flex-1 h-10 rounded-md border bg-[#f4ecd8] text-[#5b4636] ${settings.theme === "sepia" ? "ring-2 ring-primary" : ""}`}
									>
										Aa
									</button>
									<button
										onClick={() => updateSetting("theme", "dark")}
										className={`flex-1 h-10 rounded-md border bg-zinc-900 text-white ${settings.theme === "dark" ? "ring-2 ring-primary" : ""}`}
									>
										Aa
									</button>
								</div>
							</div>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Font Family</span>
								</div>
								<Select
									value={settings.fontFamily}
									onValueChange={(val) => updateSetting("fontFamily", val)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="font-sans">Sans Serif</SelectItem>
										<SelectItem value="font-serif">Serif</SelectItem>
										<SelectItem value="font-mono">Monospace</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Line Height</span>
									<span className="text-xs text-muted-foreground">
										{settings.lineHeight}
									</span>
								</div>
								<Slider
									min={1}
									max={2}
									step={0.1}
									value={[settings.lineHeight]}
									onValueChange={(vals) => updateSetting("lineHeight", vals[0])}
								/>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
