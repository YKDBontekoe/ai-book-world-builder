import Script from "next/script";
import { Suspense } from "react";
import { GlobalErrorBoundary } from "@/components/feedback/global-error-boundary";
import { BookCanvasProvider } from "@/components/organisms/book-canvas";
import { DataStreamProvider } from "@/components/organisms/chat/data-stream-provider";
import { AppearanceProvider } from "@/components/providers/appearance-provider";

/**
 * StudioLayout provides a full-screen, isolated environment for the creative studio mode.
 * It excludes the global sidebar and establishes the necessary providers for the writer.
 *
 * @param props.children - The content to render within the studio layout.
 * @returns The rendered studio layout component.
 */
export default function StudioLayout({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	return (
		<>
			<Script
				src="https://cdn.jsdelivr.net/pyodide/v0.28.2/full/pyodide.js"
				strategy="lazyOnload"
			/>
			<BookCanvasProvider>
				<DataStreamProvider>
					<AppearanceProvider>
						<Suspense fallback={<div className="flex h-dvh bg-background" />}>
							<GlobalErrorBoundary>
								{/* Studio Mode: No Global Sidebar, Full Screen Canvas */}
								<main className="flex h-dvh w-full flex-col overflow-hidden bg-background relative">
									{children}
								</main>
							</GlobalErrorBoundary>
						</Suspense>
					</AppearanceProvider>
				</DataStreamProvider>
			</BookCanvasProvider>
		</>
	);
}
