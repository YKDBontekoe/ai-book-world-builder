"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/atoms/input";

/**
 * UserSearch component providing a debounced search input that updates URL search params.
 *
 * @returns The search input component.
 */
export function UserSearch(): JSX.Element {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace } = useRouter();
	const [value, setValue] = useState(searchParams.get("search") ?? "");

	// Sync input with URL on external navigation
	useEffect(() => {
		setValue(searchParams.get("search") ?? "");
	}, [searchParams]);

	const handleSearch = useDebouncedCallback((term: string) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", "1");
		if (term) {
			params.set("search", term);
		} else {
			params.delete("search");
		}
		replace(`${pathname}?${params.toString()}`);
	}, 300);

	return (
		<div className="relative w-full max-w-sm">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				aria-label="Search users"
				placeholder="Search users..."
				className="pl-9"
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
					handleSearch(e.target.value);
				}}
			/>
		</div>
	);
}
