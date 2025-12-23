"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import {
	type Command,
	CommandPalette,
} from "@/components/organisms/command-palette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export interface CommandPaletteContextType {
	isOpen: boolean;
	openPalette: () => void;
	closePalette: () => void;
	togglePalette: () => void;
	registerCommands: (commands: Command[]) => void;
	unregisterCommands: (commandIds: string[]) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(
	null,
);

export function useCommandPalette(): CommandPaletteContextType {
	const context = useContext(CommandPaletteContext);
	if (!context) {
		throw new Error(
			"useCommandPalette must be used within CommandPaletteProvider",
		);
	}
	return context;
}

interface CommandPaletteProviderProps {
	children: ReactNode;
}

export function CommandPaletteProvider({
	children,
}: CommandPaletteProviderProps): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const [customCommands, setCustomCommands] = useState<Command[]>([]);

	const openPalette = () => setIsOpen(true);
	const closePalette = () => setIsOpen(false);
	const togglePalette = () => setIsOpen((prev) => !prev);

	const registerCommands = useCallback((commands: Command[]) => {
		setCustomCommands((prev) => {
			const map = new Map(prev.map((cmd) => [cmd.id, cmd]));
			commands.forEach((cmd) => {
				map.set(cmd.id, cmd);
			});
			return Array.from(map.values());
		});
	}, []);

	const unregisterCommands = useCallback((commandIds: string[]) => {
		setCustomCommands((prev) =>
			prev.filter((cmd) => !commandIds.includes(cmd.id)),
		);
	}, []);

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
				unregisterCommands,
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
