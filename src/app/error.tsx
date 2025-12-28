"use client";

import { useEffect } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { Button } from "@/components/atoms/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		submitFeedbackAction({
			type: "crash",
			content: `${error.name}: ${error.message}\n\nStack:\n${error.stack}\n\nDigest: ${error.digest}`,
			meta: {
				url:
					typeof window !== "undefined"
						? window.location.href
						: "client/segment",
			},
		});
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 text-center">
			<h2 className="text-xl font-bold mb-4">Something went wrong</h2>
			<Button onClick={() => reset()}>Try again</Button>
		</div>
	);
}
