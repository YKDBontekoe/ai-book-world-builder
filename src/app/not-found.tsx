"use client";

import { motion } from "framer-motion";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";

/**
 * 404 Not Found Page Component
 * Displays a user-friendly error state when a requested resource is missing.
 * Uses the 'glass' variant of EmptyState for visual consistency with the design system.
 */
export default function NotFound(): React.JSX.Element {
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
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 400, damping: 25 }}
							>
								<Button
									variant="default"
									className="shadow-lg hover:shadow-primary/25"
								>
									Return Home
								</Button>
							</motion.div>
						</Link>
					}
				/>
			</div>
		</div>
	);
}
