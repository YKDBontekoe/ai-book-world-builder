export const getAppearancePreferences = async () => ({
    success: true,
    data: {
        theme: "violet",
        editorFont: "sans",
        editorFontSize: 16,
        editorLineHeight: 1.6
    },
});

export const saveAppearancePreferences = async () => ({
    success: true,
    data: {
        theme: "violet"
    }
});
