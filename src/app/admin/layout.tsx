import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/atoms/sidebar";
import { isAdmin } from "@/lib/auth/utils";

async function AdminGuard({ children }: { children: React.ReactNode }) {
	await connection(); // Opt out of static rendering
	const session = await auth();

	if (!session?.user || !isAdmin(session.user.role)) {
		redirect("/");
	}
	return <>{children}</>;
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AdminSidebar />
			<main className="flex-1 overflow-auto bg-background p-8">
				<SidebarTrigger className="mb-4" />
				<Suspense fallback={<div>Loading admin...</div>}>
					<AdminGuard>{children}</AdminGuard>
				</Suspense>
			</main>
		</SidebarProvider>
	);
}
