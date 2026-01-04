"use client";

import { differenceInDays } from "date-fns";
import { Calendar, Check, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { cn } from "@/lib/utils";

export type DateRangePreset = "all" | "7d" | "30d" | "90d" | "year";

interface DateFilterProps {
  value: DateRangePreset;
  onChange: (value: DateRangePreset) => void;
  className?: string;
}

/**
 * A dropdown component for filtering items by date range.
 *
 * @param value - The current selected date range preset.
 * @param onChange - Callback function when the date range changes.
 * @param className - Optional CSS class for the trigger button.
 */
export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const getLabel = () => {
    switch (value) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 3 months";
      case "year":
        return "Last year";
      default:
        return "All time";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 border-dashed bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50 transition-colors",
            value !== "all" && "bg-primary/5 border-primary/20 text-primary border-solid",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {getLabel()}
          {value !== "all" && (
            <span
              role="button"
              tabIndex={0}
              className="ml-2 rounded-full p-0.5 hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onChange("all");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("all");
                }
              }}
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        <DropdownMenuLabel>Created Date</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChange("all")}>
          <span className={cn("flex-1", value === "all" && "font-medium")}>
            All time
          </span>
          {value === "all" && <Check className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("7d")}>
          <span className={cn("flex-1", value === "7d" && "font-medium")}>
            Last 7 days
          </span>
          {value === "7d" && <Check className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("30d")}>
          <span className={cn("flex-1", value === "30d" && "font-medium")}>
            Last 30 days
          </span>
          {value === "30d" && <Check className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("90d")}>
          <span className={cn("flex-1", value === "90d" && "font-medium")}>
            Last 3 months
          </span>
          {value === "90d" && <Check className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("year")}>
          <span className={cn("flex-1", value === "year" && "font-medium")}>
            Last year
          </span>
          {value === "year" && <Check className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Checks if a date falls within a specific range relative to now.
 *
 * @param date - The date to check.
 * @param range - The date range preset to filter by.
 * @returns True if the date is within the range, false otherwise.
 */
export function filterByDateRange(date: Date, range: DateRangePreset): boolean {
  if (range === "all") return true;

  const now = new Date();
  const targetDate = new Date(date);
  const diff = differenceInDays(now, targetDate);

  // Defensive check: don't include future dates if the logic implies "past X days"
  // Assuming strict past filtering.
  if (diff < 0) return false;

  switch (range) {
    case "7d":
      return diff <= 7;
    case "30d":
      return diff <= 30;
    case "90d":
      return diff <= 90;
    case "year":
      return diff <= 365;
    default:
      return true;
  }
}
