import {
	ArrowDownAZ,
	ArrowUpAZ,
	Clock,
	LayoutGrid,
	List,
	Plus,
	Search,
	Users,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { entityTypeConfig } from "@/components/organisms/book-canvas/panes/bible/types";
import { cn } from "@/lib/utils";

export type SortOption = "name-asc" | "name-desc" | "newest" | "relationships";
export type ViewMode = "list" | "grid";

interface BibleToolbarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	typeFilter: string;
	onTypeFilterChange: (value: string) => void;
	sortOption: SortOption;
	onSortChange: (value: SortOption) => void;
	viewMode: ViewMode;
	onViewModeChange: (value: ViewMode) => void;
	onCreate: () => void;
}

/**
 * A toolbar for the Story Bible containing search, filtering, sorting, and view options.
 *
 * @param props - The toolbar properties.
 * @param props.searchQuery - The current search query string.
 * @param props.onSearchChange - Callback when the search query changes.
 * @param props.typeFilter - The current entity type filter (e.g., 'all', 'character').
 * @param props.onTypeFilterChange - Callback when the type filter changes.
 * @param props.sortOption - The current sort order.
 * @param props.onSortChange - Callback when the sort order changes.
 * @param props.viewMode - The current view mode ('list' or 'grid').
 * @param props.onViewModeChange - Callback when the view mode changes.
 * @param props.onCreate - Callback when the create button is clicked.
 */
export function BibleToolbar({
	searchQuery,
	onSearchChange,
	typeFilter,
	onTypeFilterChange,
	sortOption,
	onSortChange,
	viewMode,
	onViewModeChange,
	onCreate,
}: BibleToolbarProps): React.JSX.Element {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search entities..."
						aria-label="Search entities by name or description"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						onClear={() => onSearchChange("")}
						className="pl-8 bg-background/50"
					/>
				</div>
				<TooltipProvider>
					<div className="flex gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="outline"
									className="h-9 w-9 border-dashed"
									onClick={onCreate}
									aria-label="Create new entity"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Create Entity</TooltipContent>
						</Tooltip>

						<fieldset
							className="flex bg-muted/50 rounded-lg p-1 gap-1"
							aria-label="View mode"
						>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										aria-label="List view"
										aria-pressed={viewMode === "list"}
										className={cn(
											"h-8 w-8 rounded-md",
											viewMode === "list" && "bg-background shadow-sm",
										)}
										onClick={() => onViewModeChange("list")}
									>
										<List className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>List View</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Grid view"
										aria-pressed={viewMode === "grid"}
										className={cn(
											"h-8 w-8 rounded-md",
											viewMode === "grid" && "bg-background shadow-sm",
										)}
										onClick={() => onViewModeChange("grid")}
									>
										<LayoutGrid className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Grid View</TooltipContent>
							</Tooltip>
						</fieldset>
					</div>
				</TooltipProvider>
			</div>

			<div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
				<Select value={typeFilter} onValueChange={onTypeFilterChange}>
					<SelectTrigger
						className="h-8 w-[130px] text-xs bg-background/50"
						aria-label="Filter by entity type"
					>
						<div className="flex items-center gap-2">
							<Users className="h-3.5 w-3.5" />
							<SelectValue placeholder="Type" />
						</div>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						{Object.entries(entityTypeConfig).map(([key, config]) => (
							<SelectItem key={key} value={key}>
								{config.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={sortOption}
					onValueChange={(value) => onSortChange(value as SortOption)}
				>
					<SelectTrigger
						className="h-8 w-[140px] text-xs bg-background/50"
						aria-label="Sort entities"
					>
						<div className="flex items-center gap-2">
							<SortIcon sort={sortOption} />
							<SelectValue placeholder="Sort" />
						</div>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="name-asc">Name (A-Z)</SelectItem>
						<SelectItem value="name-desc">Name (Z-A)</SelectItem>
						<SelectItem value="newest">Newest First</SelectItem>
						<SelectItem value="relationships">Most Connections</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

function SortIcon({ sort }: { sort: SortOption }): React.JSX.Element {
	switch (sort) {
		case "name-desc":
			return <ArrowUpAZ className="h-3.5 w-3.5" />;
		case "newest":
			return <Clock className="h-3.5 w-3.5" />;
		case "relationships":
			return <Users className="h-3.5 w-3.5" />;
		default:
			return <ArrowDownAZ className="h-3.5 w-3.5" />;
	}
}
