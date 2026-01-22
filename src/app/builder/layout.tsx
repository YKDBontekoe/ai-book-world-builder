import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/atoms/button";
import { isAdmin } from "@/lib/auth/utils";

export default async function BuilderLayout({
	children,
}: {
	children: React.ReactNode;
}): Promise<JSX.Element> {
	const session = await auth();

	if (!session?.user || !isAdmin(session.user.role)) {
		redirect("/");
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<Button variant="ghost" size="sm" asChild className="gap-2">
					<Link href="/platform">
						<ArrowLeft className="h-4 w-4" />
						Back to Platform
					</Link>
				</Button>
				<div className="h-4 w-px bg-border" />
				<h1 className="font-semibold text-lg">Software Builder</h1>
			</header>
			<main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
		</div>
	);
}
