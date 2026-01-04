"use client";

import "@/app/globals.css";
import { useEffect } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { Button } from "@/components/atoms/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		submitFeedbackAction({
			type: "bug",
			content: `${error.name}: ${error.message}\n\nStack:\n${error.stack}\n\nDigest: ${error.digest}`,
			meta: {
				url:
					typeof window !== "undefined"
						? window.location.href
						: "server/global",
			},
		});
	}, [error]);

	return (
		<html lang="en">
			<body className="font-sans antialiased">
				<div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
					<h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
					<p className="mb-6 text-muted-foreground">
						We've been notified. Please try reloading.
					</p>
					<Button onClick={() => reset()}>Try again</Button>
				</div>
			</body>
		</html>
	);
}
