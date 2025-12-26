import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { SidebarInset, SidebarProvider } from "@/components/atoms/sidebar";
import { Separator } from "@/components/atoms/separator";
import { GlobalErrorBoundary } from "@/components/feedback/global-error-boundary";
import { BookCanvasProvider } from "@/components/organisms/book-canvas";
import { DataStreamProvider } from "@/components/organisms/chat/data-stream-provider";
import { AppSidebar } from "@/components/organisms/sidebar/app-sidebar";
import { SidebarToggle } from "@/components/organisms/sidebar/sidebar-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Script
				src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
				strategy="lazyOnload"
			/>
			<BookCanvasProvider>
				<DataStreamProvider>
					<Suspense fallback={<div className="flex h-dvh bg-background" />}>
						<SidebarWrapper>
							{children}
						</SidebarWrapper>
					</Suspense>
				</DataStreamProvider>
			</BookCanvasProvider>
		</>
	);
}

async function SidebarWrapper({ children }: { children: React.ReactNode }) {
	const [session, cookieStore] = await Promise.all([auth(), cookies()]);
	const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

	return (
		<SidebarProvider defaultOpen={!isCollapsed}>
			<GlobalErrorBoundary>
				<AppSidebar user={session?.user} />
				<SidebarInset className="flex flex-row overflow-hidden relative">
					<div className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
						<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md bg-background/50 sticky top-0 z-30">
							<SidebarToggle />
							<Separator orientation="vertical" className="mr-2 h-4" />
							{/* Reserved for breadcrumbs or project info if needed later */}
						</header>
						{children}
					</div>
				</SidebarInset>
			</GlobalErrorBoundary>
		</SidebarProvider>
	);
}
