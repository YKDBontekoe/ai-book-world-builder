import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { BookCanvasProvider } from "@/components/organisms/book-canvas";
import { DataStreamProvider } from "@/components/organisms/chat/data-stream-provider";
import { AppSidebar } from "@/components/organisms/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/atoms/sidebar";
import { auth } from "@/app/(auth)/auth";
import { FloatingAssistant } from "@/components/organisms/chat/floating-assistant";
import { getAvailableModels } from "@/app/actions/settings";
import { getSelectedModelId } from "@/lib/ai/models";
import { GlobalErrorBoundary } from "@/components/feedback/global-error-boundary";

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
	const [session, cookieStore, availableModels, defaultModelId] = await Promise.all([
		auth(),
		cookies(),
		getAvailableModels(),
		getSelectedModelId("middle")
	]);
	const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

	return (
		<SidebarProvider defaultOpen={!isCollapsed}>
			<GlobalErrorBoundary>
				<AppSidebar user={session?.user} />
				<SidebarInset className="flex flex-row overflow-hidden relative">
					{children}
					<FloatingAssistant
						defaultModelId={defaultModelId}
						availableModels={availableModels}
					/>
				</SidebarInset>
			</GlobalErrorBoundary>
		</SidebarProvider>
	);
}
