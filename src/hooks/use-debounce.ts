import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to debounce a value.
 * @param value - The value to debounce.
 * @param delay - The delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		timerRef.current = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [value, delay]);

	return debouncedValue;
}

/**
 * Custom hook to create a debounced callback.
 * @param callback - The callback function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced version of the callback.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
	callback: T,
	delay: number,
) {
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	return (...args: Parameters<T>) => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		timerRef.current = setTimeout(() => {
			callback(...args);
		}, delay);
	};
}
