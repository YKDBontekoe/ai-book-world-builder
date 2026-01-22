import { BookOpen, Code, Settings2, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { auth } from "@/app/(auth)/auth";
import {
	FadeIn,
	SlideIn,
	StaggerItem,
	StaggerList,
} from "@/components/atoms/animated";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/atoms/card";
import { GlassCard } from "@/components/molecules/glass-card";
import { isAdmin } from "@/lib/auth/utils";

export default async function PlatformPage(): Promise<JSX.Element> {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const isUserAdmin = isAdmin(session.user.role);
	const userName = session.user.name?.split(" ")[0] || "Creator";

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/50 p-8 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950/30">
			{/* Background Elements - Subtle and Calm */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="-left-1/4 absolute top-0 h-[800px] w-[800px] animate-pulse rounded-full bg-violet-300/10 blur-[120px] dark:bg-violet-500/5" />
				<div className="-right-1/4 absolute bottom-0 h-[600px] w-[600px] animate-pulse rounded-full bg-indigo-300/10 blur-[100px] delay-1000 dark:bg-indigo-500/5" />
			</div>

			<div className="relative z-10 mx-auto max-w-5xl space-y-16 py-12">
				{/* Header Section */}
				<header className="text-center space-y-4">
					<SlideIn direction="up" delay={0.1}>
						<div className="inline-flex items-center gap-2 rounded-full border border-violet-200/50 bg-white/50 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm backdrop-blur-md dark:border-violet-800/50 dark:bg-violet-950/30 dark:text-violet-300">
							<Sparkles className="h-3 w-3" />
							<span>Creative Studio</span>
						</div>
					</SlideIn>
					<SlideIn direction="up" delay={0.2}>
						<h1 className="text-4xl font-bold tracking-tight md:text-5xl">
							Welcome back, <span className="text-primary">{userName}</span>
						</h1>
					</SlideIn>
					<FadeIn delay={0.3}>
						<p className="text-xl text-muted-foreground">
							Select a workspace to begin your journey
						</p>
					</FadeIn>
				</header>

				{/* Applications Grid */}
				<FadeIn delay={0.4}>
					<StaggerList className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
						{/* AI Book Writer */}
						<StaggerItem>
							<Link
								href="/projects"
								className="group block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
							>
								<GlassCard
									variant="liquid"
									className="h-full transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10"
								>
									<CardHeader>
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm transition-colors duration-500 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-900/30 dark:text-violet-400">
											<BookOpen className="h-7 w-7" />
										</div>
										<CardTitle className="text-2xl">AI Book Writer</CardTitle>
										<CardDescription className="text-base mt-2 line-clamp-2">
											Create rich, interconnected worlds and generate stories
											with intelligent AI assistance.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="mt-4 flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700 dark:text-violet-400 dark:group-hover:text-violet-300">
											Enter Workspace &rarr;
										</div>
									</CardContent>
								</GlassCard>
							</Link>
						</StaggerItem>

						{/* Software Builder */}
						<StaggerItem>
							{isUserAdmin ? (
								<Link
									href="/builder"
									className="group block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
								>
									<GlassCard
										variant="liquid"
										className="h-full transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10"
									>
										<CardHeader>
											<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm transition-colors duration-500 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900/30 dark:text-indigo-400">
												<Code className="h-7 w-7" />
											</div>
											<CardTitle className="text-2xl">
												Software Builder
											</CardTitle>
											<CardDescription className="text-base mt-2 line-clamp-2">
												Manage software development lifecycles, GitHub
												integration, and AI coding agents.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="mt-4 flex items-center text-sm font-medium text-indigo-600 transition-colors group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
												Enter Workspace &rarr;
											</div>
										</CardContent>
									</GlassCard>
								</Link>
							) : (
								<div
									aria-disabled="true"
									className="group block h-full opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
								>
									<GlassCard variant="subtle" className="h-full border-dashed">
										<CardHeader>
											<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
												<Code className="h-7 w-7" />
											</div>
											<CardTitle className="text-2xl text-muted-foreground">
												Software Builder
											</CardTitle>
											<CardDescription className="text-base mt-2">
												Manage software development lifecycles, GitHub
												integration, and AI coding agents.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
												<Settings2 className="h-4 w-4" />
												<span>Admin Access Only</span>
											</div>
										</CardContent>
									</GlassCard>
								</div>
							)}
						</StaggerItem>
					</StaggerList>
				</FadeIn>
			</div>
		</div>
	);
}
