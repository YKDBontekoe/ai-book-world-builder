"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, FolderIcon, PlusIcon, TrashIcon, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardSheet } from "@/components/organisms/dashboard/dashboard-sheet";
import { SidebarHistory } from "@/components/organisms/sidebar/sidebar-history";
import { SidebarUserNav } from "@/components/organisms/sidebar/sidebar-user-nav";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/atoms/alert-dialog";
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
import { api } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-options";

export function AppSidebar({ user }: { user: User | undefined }) {
	const router = useRouter();
	const { setOpenMobile } = useSidebar();
	const queryClient = useQueryClient();
	const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

	const { mutate: handleDeleteAll } = useMutation({
		mutationFn: async () => {
			return api.delete("/api/history");
		},
		onMutate: () => {
			toast.loading("Deleting all chats...", { id: "delete-all-chats" });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chatHistory() });
			router.push("/");
			setShowDeleteAllDialog(false);
			toast.success("All chats deleted successfully", {
				id: "delete-all-chats",
			});
		},
		onError: () => {
			toast.error("Failed to delete all chats", { id: "delete-all-chats" });
		},
	});

	return (
		<>
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
								{user && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												className="h-8 p-1 md:h-fit md:p-2"
												onClick={() => setShowDeleteAllDialog(true)}
												type="button"
												variant="ghost"
											>
												<TrashIcon size={16} />
											</Button>
										</TooltipTrigger>
										<TooltipContent align="end" className="hidden md:block">
											Delete All Chats
										</TooltipContent>
									</Tooltip>
								)}
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
						<DashboardSheet
							trigger={
								<Button className="w-full justify-start gap-2" variant="ghost">
									<LayoutDashboard size={16} /> Dashboard
								</Button>
							}
						/>
						<Link href="/exports" onClick={() => setOpenMobile(false)}>
							<Button className="w-full justify-start gap-2" variant="ghost">
								<DownloadIcon size={16} /> My Exports
							</Button>
						</Link>
					</div>
					<SidebarHistory user={user} />
				</SidebarContent>
				<SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
			</Sidebar>

			<AlertDialog
				onOpenChange={setShowDeleteAllDialog}
				open={showDeleteAllDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete all chats?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete all
							your chats and remove them from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => handleDeleteAll()}>
							Delete All
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
