import { Globe, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectTabsProps {
	currentTab: "mine" | "shared";
}

export function ProjectTabs({ currentTab }: ProjectTabsProps) {
	return (
		<div className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground mb-6">
			<Link
				href="?tab=mine"
				replace
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
					currentTab === "mine"
						? "bg-background text-foreground shadow-sm"
						: "hover:bg-background/50",
				)}
			>
				<User className="h-4 w-4" />
				My Projects
			</Link>
			<Link
				href="?tab=shared"
				replace
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
					currentTab === "shared"
						? "bg-background text-foreground shadow-sm"
						: "hover:bg-background/50",
				)}
			>
				<Globe className="h-4 w-4" />
				Community
			</Link>
		</div>
	);
}
