"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { CommandPalette, type Command } from "@/components/organisms/command-palette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface CommandPaletteContextValue {
	isOpen: boolean;
	openPalette: () => void;
	closePalette: () => void;
	togglePalette: () => void;
	registerCommands: (commands: Command[]) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
	null
);

export function useCommandPalette() {
	const context = useContext(CommandPaletteContext);
	if (!context) {
		throw new Error(
			"useCommandPalette must be used within CommandPaletteProvider"
		);
	}
	return context;
}

interface CommandPaletteProviderProps {
	children: ReactNode;
}

export function CommandPaletteProvider({
	children,
}: CommandPaletteProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [customCommands, setCustomCommands] = useState<Command[]>([]);

	const openPalette = () => setIsOpen(true);
	const closePalette = () => setIsOpen(false);
	const togglePalette = () => setIsOpen((prev) => !prev);

	const registerCommands = (commands: Command[]) => {
		setCustomCommands((prev) => [...prev, ...commands]);
	};

	// Register global Cmd+K shortcut
	useKeyboardShortcuts({
		shortcuts: [
			{
				key: "k",
				meta: true,
				handler: () => togglePalette(),
				description: "Open command palette",
				category: "Navigation",
			},
		],
	});

	return (
		<CommandPaletteContext.Provider
			value={{
				isOpen,
				openPalette,
				closePalette,
				togglePalette,
				registerCommands,
			}}
		>
			{children}
			<CommandPalette
				isOpen={isOpen}
				onClose={closePalette}
				commands={customCommands.length > 0 ? customCommands : undefined}
			/>
		</CommandPaletteContext.Provider>
	);
}
