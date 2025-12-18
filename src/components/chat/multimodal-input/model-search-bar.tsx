import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortOption } from "./constants";
import { SortMenu } from "./sort-menu";

type ModelSearchBarProps = {
        searchQuery: string;
        onSearchChange: (query: string) => void;
        sortOption: SortOption;
        onSortChange: (option: SortOption) => void;
};

export function ModelSearchBar({ searchQuery, onSearchChange, sortOption, onSortChange }: ModelSearchBarProps) {
        return (
                <div className="relative mb-2 flex items-center gap-2">
                        <div className="relative flex-1">
                                <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                        className={cn(
                                                "w-full rounded-lg border bg-muted/50 py-2 pl-8 pr-3 text-sm outline-none",
                                                "placeholder:text-muted-foreground",
                                                "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
                                        )}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        placeholder="Search models..."
                                        type="text"
                                        value={searchQuery}
                                        data-testid="model-search"
                                />
                        </div>
                        <SortMenu onChange={onSortChange} sortOption={sortOption} />
                </div>
        );
}
