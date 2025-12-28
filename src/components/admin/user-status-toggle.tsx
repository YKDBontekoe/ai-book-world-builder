"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { toggleUserStatus } from "@/app/actions/admin";
import { Button } from "@/components/atoms/button";

export function UserStatusToggle({
	userId,
	isBanned,
}: {
	userId: string;
	isBanned: boolean;
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleToggle = async () => {
		try {
			setIsLoading(true);
			const result = await toggleUserStatus(userId);
			if (result.success) {
				toast.success(result.banned ? "User banned" : "User activated");
				router.refresh();
			}
		} catch (_error) {
			toast.error("Failed to update user status");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={isBanned ? "outline" : "destructive"}
			onClick={handleToggle}
			disabled={isLoading}
		>
			{isBanned ? "Unban User" : "Ban User"}
		</Button>
	);
}
