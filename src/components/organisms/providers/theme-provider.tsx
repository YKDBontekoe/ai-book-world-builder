"use client";

import {
	type ThemeProviderProps as NextThemeProviderProps,
	ThemeProvider as NextThemesProvider,
} from "next-themes";
import type { PropsWithChildren } from "react";

export function ThemeProvider({
	children,
	...props
}: PropsWithChildren<NextThemeProviderProps>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
