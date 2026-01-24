interface ConnectedAccount {
	provider: string;
}

interface ActionResponse<T> {
	success: boolean;
	data: T;
}

export const getConnectedAccounts = async (): Promise<
	ActionResponse<ConnectedAccount[]>
> => ({
	success: true,
	data: [{ provider: "google" }],
});
