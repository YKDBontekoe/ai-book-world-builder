import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FavoriteToggleProps = {
        isFavorite: boolean;
        onToggle: (event: React.MouseEvent | React.PointerEvent) => void;
        disabled?: boolean;
};

export function FavoriteToggle({ isFavorite, onToggle, disabled }: FavoriteToggleProps) {
        return (
                <button
                        type="button"
                        aria-pressed={isFavorite}
                        data-state={isFavorite ? "on" : "off"}
                        data-testid="favorite-toggle"
                        disabled={disabled}
                        onPointerDown={onToggle}
                        className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all",
                                "opacity-0 group-hover:opacity-100",
                                isFavorite && "opacity-100",
                                isFavorite
                                        ? "bg-yellow-500/20 text-yellow-500"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                disabled && "cursor-not-allowed opacity-50",
                        )}
                >
                        <StarIcon
                                className={cn("h-3.5 w-3.5", isFavorite && "fill-current")}
                        />
                </button>
        );
}
