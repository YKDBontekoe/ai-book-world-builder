"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/atoms/input";

export function UserSearch() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace } = useRouter();

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
				placeholder="Search users..."
				className="pl-9"
				onChange={(e) => handleSearch(e.target.value)}
				defaultValue={searchParams.get("search")?.toString()}
			/>
		</div>
	);
}
