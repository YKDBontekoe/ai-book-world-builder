import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import { SORT_OPTION_METADATA, SORT_SEQUENCE, type SortOption } from "@/components/organisms/chat/multimodal-input/constants";

type SortMenuProps = {
        sortOption: SortOption;
        onChange: (option: SortOption) => void;
};

export function SortMenu({ sortOption, onChange }: SortMenuProps) {
        const { icon: Icon, label } = SORT_OPTION_METADATA[sortOption];
        const handleClick = () => {
                const next = SORT_SEQUENCE[sortOption];
                onChange(next);
        };

        return (
                <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Sort by ${label}`}
                        className={cn(
                                "h-9 w-9 shrink-0 border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                                sortOption !== "relevance" && "border-primary/50 bg-primary/10 text-primary",
                        )}
                        onClick={handleClick}
                        data-testid="model-sort-menu"
                >
                        <Icon className="h-4 w-4" />
                </Button>
        );
}
