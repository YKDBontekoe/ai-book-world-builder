import {
	ArrowRight,
	BookOpen,
	Globe,
	LayoutTemplate,
	Palette,
	PlayCircle,
	Sparkles,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import {
	FadeIn,
	SlideIn,
	StaggerItem,
	StaggerList,
} from "@/components/atoms/animated";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";

export default function Page() {
	return (
		<>
			<Suspense fallback={null}>
				<AuthRedirect />
			</Suspense>
			<LandingPageContent />
		</>
	);
}

async function AuthRedirect() {
	const session = await auth();

	if (session) {
		redirect("/projects");
	}

	return null;
}

function LandingPageContent() {
	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950/30">
			{/* Animated background elements - slightly refined for subtlety */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="-left-1/4 absolute top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-300/10 blur-[100px] dark:bg-violet-500/10" />
				<div className="-right-1/4 absolute top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-indigo-300/10 blur-[100px] delay-1000 dark:bg-indigo-500/10" />
				<div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] animate-pulse rounded-full bg-purple-300/10 blur-[80px] delay-500 dark:bg-purple-500/10" />
			</div>

			{/* Header */}
			<header className="relative z-10 border-white/20 border-b bg-white/40 backdrop-blur-xl dark:border-zinc-800/30 dark:bg-zinc-900/30">
				<div className="container mx-auto flex items-center justify-between px-6 py-4">
					<div className="flex items-center gap-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
							<BookOpen className="h-6 w-6 text-white" />
						</div>
						<h1 className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
							AI Book World Builder
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<Link href="/login">
							<Button
								variant="ghost"
								className="hover:bg-white/50 dark:hover:bg-white/10"
							>
								Sign In
							</Button>
						</Link>
						<Link href="/register">
							<Button
								className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
								size="sm"
							>
								Get Started
							</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 lg:py-32">
				<div className="mx-auto max-w-5xl text-center">
					<SlideIn
						direction="up"
						className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200/50 bg-white/50 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-md dark:border-violet-800/50 dark:bg-violet-950/30 dark:text-violet-300"
					>
						<Sparkles className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
						<span>AI-Powered World Building Suite</span>
					</SlideIn>

					<SlideIn
						direction="up"
						delay={0.1}
						className="mb-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text pb-2 font-bold text-6xl text-transparent leading-[1.1] tracking-tight md:text-7xl lg:text-8xl dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400"
					>
						<h2>Build Your Story Universe</h2>
					</SlideIn>

					<SlideIn
						direction="up"
						delay={0.2}
						className="mx-auto mb-12 max-w-2xl text-lg text-zinc-600 md:text-xl leading-relaxed dark:text-zinc-300"
					>
						<p>
							Create rich, interconnected worlds for your books with intelligent
							AI assistance. Manage characters, locations, timelines, and lore
							in one cohesive workspace.
						</p>
					</SlideIn>

					<SlideIn
						direction="up"
						delay={0.3}
						className="mb-24 flex flex-wrap items-center justify-center gap-4"
					>
						<Link href="/register">
							<Button
								className="h-12 rounded-full bg-zinc-900 px-8 font-semibold text-white shadow-xl shadow-zinc-900/20 transition-all hover:scale-105 hover:bg-zinc-800 hover:shadow-2xl dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
								size="lg"
							>
								Start Building Free
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
						<Link href="#features">
							<Button
								variant="outline"
								className="h-12 rounded-full border-zinc-200 bg-white/50 px-8 font-medium backdrop-blur-sm hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
								size="lg"
							>
								<PlayCircle className="mr-2 h-4 w-4" />
								How it Works
							</Button>
						</Link>
					</SlideIn>

					{/* How It Works Section */}
					<FadeIn delay={0.4} className="mb-24">
						<h3 className="mb-12 font-semibold text-2xl text-zinc-900 text-center dark:text-white">
							Your creative workflow, reimagined
						</h3>
						<StaggerList
							className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto"
							variants={{
								hidden: { opacity: 0 },
								visible: {
									opacity: 1,
									transition: { staggerChildren: 0.15 },
								},
							}}
						>
							<StaggerItem>
								<GlassCard
									variant="liquid"
									className="flex flex-col items-center text-center p-8 relative overflow-hidden h-full"
								>
									<div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
									<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
										<Globe className="h-8 w-8" />
									</div>
									<h4 className="mb-2 font-semibold text-lg">
										1. Define Your World
									</h4>
									<p className="text-zinc-500 dark:text-zinc-400">
										Set the stage with locations, cultures, and lore that form
										the foundation.
									</p>
								</GlassCard>
							</StaggerItem>
							<StaggerItem>
								<GlassCard
									variant="liquid"
									className="flex flex-col items-center text-center p-8 relative overflow-hidden h-full"
								>
									<div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
									<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
										<Users className="h-8 w-8" />
									</div>
									<h4 className="mb-2 font-semibold text-lg">
										2. Populate Characters
									</h4>
									<p className="text-zinc-500 dark:text-zinc-400">
										Create deep, interconnected characters with AI-assisted
										backstories.
									</p>
								</GlassCard>
							</StaggerItem>
							<StaggerItem>
								<GlassCard
									variant="liquid"
									className="flex flex-col items-center text-center p-8 relative overflow-hidden h-full"
								>
									<div className="absolute -right-10 -top-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
									<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
										<BookOpen className="h-8 w-8" />
									</div>
									<h4 className="mb-2 font-semibold text-lg">
										3. Generate Story
									</h4>
									<p className="text-zinc-500 dark:text-zinc-400">
										Weave your elements together into outlines, chapters, and
										full scenes.
									</p>
								</GlassCard>
							</StaggerItem>
						</StaggerList>
					</FadeIn>

					{/* Feature Grid */}
					<StaggerList
						id="features"
						className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
					>
						<StaggerItem>
							<FeatureCard
								description="Create detailed character profiles with relationships, backstories, and development arcs."
								gradient="from-violet-500 to-purple-500"
								icon={<Users className="h-6 w-6" />}
								title="Character Management"
							/>
						</StaggerItem>
						<StaggerItem>
							<FeatureCard
								description="Design locations, cultures, and political systems that bring your world to life."
								gradient="from-indigo-500 to-blue-500"
								icon={<Globe className="h-6 w-6" />}
								title="World Building"
							/>
						</StaggerItem>
						<StaggerItem>
							<FeatureCard
								description="Get intelligent suggestions for plot points, character development, and world consistency."
								gradient="from-purple-500 to-pink-500"
								icon={<Zap className="h-6 w-6" />}
								title="AI-Powered Assistance"
							/>
						</StaggerItem>
						<StaggerItem>
							<FeatureCard
								description="Structure your story with chapters, scenes, and outlines that keep you on track."
								gradient="from-blue-500 to-cyan-500"
								icon={<LayoutTemplate className="h-6 w-6" />}
								title="Chapter Organization"
							/>
						</StaggerItem>
						<StaggerItem>
							<FeatureCard
								description="See your entire story structure at a glance with our interactive book canvas."
								gradient="from-pink-500 to-rose-500"
								icon={<Palette className="h-6 w-6" />}
								title="Visual Canvas"
							/>
						</StaggerItem>
						<StaggerItem>
							<FeatureCard
								description="Track magic systems, technologies, and rules that govern your universe."
								gradient="from-cyan-500 to-teal-500"
								icon={<Sparkles className="h-6 w-6" />}
								title="Lore Management"
							/>
						</StaggerItem>
					</StaggerList>
				</div>
			</main>

			{/* Footer */}
			<footer className="relative z-10 border-zinc-200/50 border-t bg-white/40 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/40">
				<div className="container mx-auto px-6 py-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
								<BookOpen className="h-4 w-4 text-white" />
							</div>
							<span className="font-semibold text-zinc-900 dark:text-white">
								AI Book World Builder
							</span>
						</div>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							© 2024 AI Book World Builder. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
	gradient,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	gradient: string;
}) {
	return (
		<GlassCard
			variant="liquid"
			className="group relative overflow-hidden p-6 hover:-translate-y-1 transition-transform duration-300 h-full"
		>
			<div
				className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]`}
			/>
			<div
				className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-20`}
			/>
			<div className="relative">
				<div
					className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg shadow-indigo-500/20`}
				>
					{icon}
				</div>
				<h3 className="mb-2 font-bold text-lg text-zinc-900 dark:text-white">
					{title}
				</h3>
				<p className="text-sm text-zinc-500 leading-relaxed dark:text-zinc-400">
					{description}
				</p>
			</div>
		</GlassCard>
	);
}
