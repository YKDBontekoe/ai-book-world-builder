import type { Metadata } from "next";
import type React from "react";
import TycoonGame from "@/features/factory-tycoon/TycoonGame";

export const metadata: Metadata = {
	title: "Factory Tycoon",
	description: "A resource management tycoon game.",
};

export default function Page(): React.JSX.Element {
	return (
		<main className="h-screen w-full">
			<TycoonGame />
		</main>
	);
}
