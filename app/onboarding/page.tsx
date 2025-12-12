import { BookOpen, Globe, Palette, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950">
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="-left-1/4 absolute top-0 h-96 w-96 animate-pulse rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10" />
				<div className="-right-1/4 absolute top-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-300/20 blur-3xl delay-1000 dark:bg-indigo-500/10" />
				<div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-purple-300/20 blur-3xl delay-500 dark:bg-purple-500/10" />
			</div>

			{/* Header */}
			<header className="relative z-10 border-zinc-200/50 border-b bg-white/50 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/50">
				<div className="container mx-auto flex items-center justify-between px-6 py-4">
					<div className="flex items-center gap-2">
						<BookOpen className="h-8 w-8 text-violet-600 dark:text-violet-400" />
						<h1 className="font-bold text-2xl text-zinc-900 dark:text-white">
							AI Book World Builder
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<Link href="/login">
							<Button size="sm" variant="ghost">
								Sign In
							</Button>
						</Link>
						<Link href="/register">
							<Button className="bg-violet-600 hover:bg-violet-700" size="sm">
								Get Started
							</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
				<div className="mx-auto max-w-6xl text-center">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
						<Sparkles className="h-4 w-4" />
						<span>AI-Powered World Building</span>
					</div>

					<h2 className="mb-6 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text font-bold text-5xl text-transparent md:text-7xl dark:from-violet-400 dark:to-indigo-400">
						Build Your Story Universe
					</h2>

					<p className="mb-12 text-xl text-zinc-600 md:text-2xl dark:text-zinc-300">
						Create rich, interconnected worlds for your books with AI
						assistance.
						<br />
						Manage characters, locations, timelines, and lore in one place.
					</p>

					<div className="mb-16 flex flex-wrap items-center justify-center gap-4">
						<Link href="/register">
							<Button
								className="h-14 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 font-semibold text-lg shadow-lg shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-violet-500/40 hover:shadow-xl"
								size="lg"
							>
								Get Started Free
							</Button>
						</Link>
					</div>

					{/* Feature Grid */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<FeatureCard
							description="Create detailed character profiles with relationships, backstories, and development arcs."
							gradient="from-violet-500 to-purple-500"
							icon={<Users className="h-8 w-8" />}
							title="Character Management"
						/>
						<FeatureCard
							description="Design locations, cultures, and political systems that bring your world to life."
							gradient="from-indigo-500 to-blue-500"
							icon={<Globe className="h-8 w-8" />}
							title="World Building"
						/>
						<FeatureCard
							description="Get intelligent suggestions for plot points, character development, and world consistency."
							gradient="from-purple-500 to-pink-500"
							icon={<Zap className="h-8 w-8" />}
							title="AI-Powered Assistance"
						/>
						<FeatureCard
							description="Structure your story with chapters, scenes, and outlines that keep you on track."
							gradient="from-blue-500 to-cyan-500"
							icon={<BookOpen className="h-8 w-8" />}
							title="Chapter Organization"
						/>
						<FeatureCard
							description="See your entire story structure at a glance with our interactive book canvas."
							gradient="from-pink-500 to-rose-500"
							icon={<Palette className="h-8 w-8" />}
							title="Visual Canvas"
						/>
						<FeatureCard
							description="Track magic systems, technologies, and rules that govern your universe."
							gradient="from-cyan-500 to-teal-500"
							icon={<Sparkles className="h-8 w-8" />}
							title="Lore Management"
						/>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="relative z-10 border-zinc-200/50 border-t bg-white/50 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/50">
				<div className="container mx-auto px-6 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
					<p>© 2024 AI Book World Builder. Start building your story today.</p>
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
		<div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:scale-105 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
			<div
				className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`}
			/>
			<div className="relative">
				<div
					className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}
				>
					{icon}
				</div>
				<h3 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-white">
					{title}
				</h3>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					{description}
				</p>
			</div>
		</div>
	);
}
