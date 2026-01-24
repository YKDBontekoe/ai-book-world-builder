import type React from "react";

export const signIn = async (): Promise<void> => {};
export const useSession = (): { data: null; status: string } => ({
	data: null,
	status: "unauthenticated",
});
export const SessionProvider = ({
	children,
}: {
	children: React.ReactNode;
}): React.ReactNode => children;
