import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { BookCanvas, BookCanvasProvider } from "@/components/organisms/book-canvas";
import { DataStreamProvider } from "@/components/organisms/chat/data-stream-provider";
import { AppSidebar } from "@/components/organisms/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/atoms/sidebar";
import { auth } from "@/app/(auth)/auth";

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
							<div className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
								{children}
							</div>
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
			<AppSidebar user={session?.user} />
			<SidebarInset className="flex flex-row overflow-hidden">
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
