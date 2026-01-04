"use client";

import { differenceInDays } from "date-fns";
import { Calendar, ChevronDown, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
                if(e.key === 'Enter') {
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
          {value === "all" && <CheckIcon className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("7d")}>
          <span className={cn("flex-1", value === "7d" && "font-medium")}>
            Last 7 days
          </span>
          {value === "7d" && <CheckIcon className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("30d")}>
          <span className={cn("flex-1", value === "30d" && "font-medium")}>
            Last 30 days
          </span>
          {value === "30d" && <CheckIcon className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("90d")}>
          <span className={cn("flex-1", value === "90d" && "font-medium")}>
            Last 3 months
          </span>
          {value === "90d" && <CheckIcon className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => onChange("year")}>
          <span className={cn("flex-1", value === "year" && "font-medium")}>
            Last year
          </span>
          {value === "year" && <CheckIcon className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function filterByDateRange(date: Date, range: DateRangePreset): boolean {
  if (range === "all") return true;

  const now = new Date();
  const targetDate = new Date(date);
  const diff = differenceInDays(now, targetDate);

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
