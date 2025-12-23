"use client";

import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	meta?: boolean; // Cmd on Mac, Win on Windows
	handler: (event: KeyboardEvent) => void;
	description?: string;
	category?: string;
	enabled?: boolean;
	preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
	shortcuts: KeyboardShortcut[];
	enabled?: boolean;
}

/**
 * Hook to register global keyboard shortcuts
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'k',
 *       meta: true,
 *       handler: () => openCommandPalette(),
 *       description: 'Open command palette',
 *       category: 'Navigation'
 *     }
 *   ]
 * });
 * ```
 */
export function useKeyboardShortcuts({
	shortcuts,
	enabled = true,
}: UseKeyboardShortcutsOptions): void {
	const shortcutsRef = useRef(shortcuts);

	// Update ref when shortcuts change
	useEffect(() => {
		shortcutsRef.current = shortcuts;
	}, [shortcuts]);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		// Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
		const target = event.target as HTMLElement;
		const isTyping =
			target.tagName === "INPUT" ||
			target.tagName === "TEXTAREA" ||
			target.isContentEditable;

		for (const shortcut of shortcutsRef.current) {
			// Skip if shortcut is disabled
			if (shortcut.enabled === false) continue;

			// Check if the key matches
			const keyMatches =
				event.key.toLowerCase() === shortcut.key.toLowerCase();
			if (!keyMatches) continue;

			// Check modifiers
			const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
			const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
			const altMatches = shortcut.alt ? event.altKey : !event.altKey;
			const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

			if (ctrlMatches && shiftMatches && altMatches && metaMatches) {
				// Special case: Allow Cmd+K even when typing
				const isCommandPalette = shortcut.key === "k" && shortcut.meta;
				
				if (!isTyping || isCommandPalette) {
					if (shortcut.preventDefault !== false) {
						event.preventDefault();
					}
					shortcut.handler(event);
					break;
				}
			}
		}
	}, []);

	useEffect(() => {
		if (!enabled) return;

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, handleKeyDown]);
}

/**
 * Get the display string for a keyboard shortcut
 */
export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
	const parts: string[] = [];

	if (shortcut.ctrl) parts.push("Ctrl");
	if (shortcut.alt) parts.push("Alt");
	if (shortcut.shift) parts.push("Shift");
	if (shortcut.meta) {
		// Use Cmd symbol on Mac, Ctrl on Windows
		const isMac =
			typeof navigator !== "undefined" &&
			navigator.platform.toUpperCase().indexOf("MAC") >= 0;
		parts.push(isMac ? "⌘" : "Ctrl");
	}

	parts.push(shortcut.key.toUpperCase());

	return parts.join("+");
}
