import type { Metadata } from "next";
import TycoonGame from "@/features/factory-tycoon/TycoonGame";

export const metadata: Metadata = {
	title: "Factory Tycoon",
	description: "A resource management tycoon game.",
};

export default function Page() {
	return (
		<main className="h-screen w-full">
			<TycoonGame />
		</main>
	);
}
