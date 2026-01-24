interface AppearancePreferences {
	theme: string;
	editorFont?: string;
	editorFontSize?: number;
	editorLineHeight?: number;
}

interface ActionResponse<T> {
	success: boolean;
	data: T;
}

export const getAppearancePreferences = async (): Promise<
	ActionResponse<AppearancePreferences>
> => ({
	success: true,
	data: {
		theme: "violet",
		editorFont: "sans",
		editorFontSize: 16,
		editorLineHeight: 1.6,
	},
});

export const saveAppearancePreferences = async (): Promise<
	ActionResponse<Partial<AppearancePreferences>>
> => ({
	success: true,
	data: {
		theme: "violet",
	},
});
