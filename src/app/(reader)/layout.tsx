import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Book Reader",
	description: "Distraction-free reading mode",
};

export default function ReaderLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="h-screen w-screen overflow-hidden bg-background text-foreground">
			{children}
		</div>
	);
}
