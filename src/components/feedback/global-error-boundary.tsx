"use client";

import { AlertTriangle } from "lucide-react";
import React from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { Button } from "@/components/atoms/button";

interface Props {
	children: React.ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
		// Automatically submit crash report
		submitFeedbackAction({
			type: "bug",
			content: `${error.name}: ${error.message}\n\nStack:\n${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`,
			meta: {
				url: typeof window !== "undefined" ? window.location.href : "server",
			},
		});
	}

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
					<AlertTriangle className="h-12 w-12 text-destructive mb-4" />
					<h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
					<p className="text-muted-foreground mb-6 max-w-md">
						We've been notified about this issue and are working to fix it.
						Please try reloading the page.
					</p>
					<Button onClick={this.handleReload}>Reload Page</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
