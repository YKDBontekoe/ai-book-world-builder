"use client";

import {
	ThemeProvider as NextThemesProvider,
	type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({
	children,
	...props
}: {
	children: React.ReactNode;
	[key: string]: any;
}) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
