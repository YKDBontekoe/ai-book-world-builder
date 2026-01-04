import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/atoms/sidebar";
import { isAdmin } from "@/lib/auth/utils";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await connection(); // Force dynamic for the entire layout
	const session = await auth(); // Check auth at layout level safely now

	if (!session?.user || !isAdmin(session.user.role)) {
		redirect("/");
	}

	return (
		<SidebarProvider>
			<AdminSidebar />
			<main className="flex-1 overflow-auto bg-background p-8">
				<SidebarTrigger className="mb-4" />
				{children}
			</main>
		</SidebarProvider>
	);
}
