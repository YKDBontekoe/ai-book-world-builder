"use client";

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

interface CreditCardAlertProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreditCardAlert({ open, onOpenChange }: CreditCardAlertProps) {
	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
					<AlertDialogDescription>
						This application requires{" "}
						{process.env.NODE_ENV === "production" ? "the owner" : "you"} to
						activate Vercel AI Gateway.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							window.open(
								"https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
								"_blank",
							);
							window.location.href = "/";
						}}
					>
						Activate
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
