"use client";

import {
	DownloadIcon,
	FolderIcon,
	MessageSquarePlus,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	useSidebar,
} from "@/components/atoms/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { SidebarUserNav } from "@/components/organisms/sidebar/sidebar-user-nav";

export function AppSidebar({ user }: { user: User | undefined }) {
	const router = useRouter();
	const { setOpenMobile } = useSidebar();
	const [showFeedback, setShowFeedback] = useState(false);

	return (
		<>
			<FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />
			<Sidebar className="group-data-[side=left]:border-r-0">
				<SidebarHeader>
					<SidebarMenu>
						<div className="flex flex-row items-center justify-between">
							<div className="flex flex-row items-center gap-2">
								<Link
									className="flex flex-row items-center gap-3"
									href="/"
									onClick={() => {
										setOpenMobile(false);
									}}
								>
									<span className="cursor-pointer rounded-md px-2 font-semibold text-lg hover:bg-muted">
										Story Studio
									</span>
								</Link>
							</div>
							<div className="flex flex-row gap-1">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											className="h-8 p-1 md:h-fit md:p-2"
											onClick={() => {
												setOpenMobile(false);
												router.push("/");
												router.refresh();
											}}
											type="button"
											variant="ghost"
										>
											<PlusIcon size={16} />
										</Button>
									</TooltipTrigger>
									<TooltipContent align="end" className="hidden md:block">
										New Story
									</TooltipContent>
								</Tooltip>
							</div>
						</div>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<div className="flex flex-col gap-1 p-2">
						<Link href="/" onClick={() => setOpenMobile(false)}>
							<Button className="w-full justify-start gap-2" variant="default">
								<PlusIcon size={16} /> New Story
							</Button>
						</Link>
						<Link href="/projects" onClick={() => setOpenMobile(false)}>
							<Button className="w-full justify-start gap-2" variant="ghost">
								<FolderIcon size={16} /> Projects
							</Button>
						</Link>
						<Link href="/exports" onClick={() => setOpenMobile(false)}>
							<Button className="w-full justify-start gap-2" variant="ghost">
								<DownloadIcon size={16} /> My Exports
							</Button>
						</Link>
						<Button
							className="w-full justify-start gap-2"
							variant="ghost"
							onClick={() => setShowFeedback(true)}
						>
							<MessageSquarePlus size={16} /> Feedback
						</Button>
					</div>
				</SidebarContent>
				<SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
			</Sidebar>
		</>
	);
}
