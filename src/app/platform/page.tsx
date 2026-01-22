import { BookOpen, Code, Settings2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { auth } from "@/app/(auth)/auth";
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950/30 p-8">
			<div className="mx-auto max-w-5xl space-y-12">
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold tracking-tight">
						Platform Dashboard
					</h1>
					<p className="text-xl text-muted-foreground">
						Select an application to launch
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
					{/* AI Book Writer */}
					<Link href="/projects" className="group block h-full">
						<GlassCard
							variant="liquid"
							className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer"
						>
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
									<BookOpen className="h-6 w-6" />
								</div>
								<CardTitle className="text-2xl">AI Book Writer</CardTitle>
								<CardDescription className="text-base mt-2">
									Create rich, interconnected worlds and generate stories with
									intelligent AI assistance.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center text-sm font-medium text-violet-600 dark:text-violet-400">
									Launch Application &rarr;
								</div>
							</CardContent>
						</GlassCard>
					</Link>

					{/* Software Builder */}
					{isUserAdmin ? (
						<Link href="/builder" className="group block h-full">
							<GlassCard
								variant="liquid"
								className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
							>
								<CardHeader>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
										<Code className="h-6 w-6" />
									</div>
									<CardTitle className="text-2xl">Software Builder</CardTitle>
									<CardDescription className="text-base mt-2">
										Manage software development lifecycles, GitHub integration,
										and AI coding agents.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
											Launch Application &rarr;
										</div>
									</div>
								</CardContent>
							</GlassCard>
						</Link>
					) : (
						<div
							aria-disabled="true"
							className="group block h-full opacity-50 cursor-not-allowed pointer-events-none"
						>
							<GlassCard variant="liquid" className="h-full">
								<CardHeader>
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors duration-300">
										<Code className="h-6 w-6" />
									</div>
									<CardTitle className="text-2xl">Software Builder</CardTitle>
									<CardDescription className="text-base mt-2">
										Manage software development lifecycles, GitHub integration,
										and AI coding agents.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
											<span className="flex items-center gap-2">
												<Settings2 className="h-4 w-4" /> Admin Access Only
											</span>
										</div>
									</div>
								</CardContent>
							</GlassCard>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
