import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="relative w-full max-w-md">
				{/* Background glow effect */}
				<div className="absolute inset-0 -z-10 bg-primary/20 blur-3xl rounded-full opacity-20 transform scale-150" />

				<EmptyState
					variant="glass"
					icon={FileQuestion}
					title="Page Not Found"
					description="The page you are looking for doesn't exist or has been moved."
					action={
						<Link href="/">
							<Button
								variant="default"
								className="shadow-lg hover:shadow-primary/25 transition-all duration-300"
							>
								Return Home
							</Button>
						</Link>
					}
				/>
			</div>
		</div>
	);
}
