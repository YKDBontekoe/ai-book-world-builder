import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

export default function Page() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-background">
					<LoadingSpinner size="lg" />
				</div>
			}
		>
			<AuthRedirect />
		</Suspense>
	);
}

async function AuthRedirect() {
	const session = await auth();

	if (session) {
		redirect("/projects");
	}

	redirect("/login");

	// This is unreachable but satisfies TS return type for async component if needed,
	// though typically `redirect` throws.
	return null;
}
