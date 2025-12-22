"use client";

import { useState, useMemo } from "react";
import { Search, ArrowDownAZ, ArrowUpAZ, Clock } from "lucide-react";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { ProjectGrid } from "@/components/organisms/projects/project-grid";
import type { Project } from "@/lib/db/schema";
import { Button } from "@/components/atoms/button";
import { motion } from "framer-motion";

type SortOption = "newest" | "oldest" | "a-z" | "z-a";

export function ProjectBrowser({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, sortOption]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <SortIcon sort={sortOption} />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="a-z">Name (A-Z)</SelectItem>
              <SelectItem value="z-a">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative min-h-[200px]">
         {filteredProjects.length === 0 && searchQuery ? (
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
             >
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">Try adjusting your search query</p>
                <Button
                    variant="link"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-primary"
                >
                    Clear search
                </Button>
             </motion.div>
         ) : (
             <ProjectGrid projects={filteredProjects} />
         )}
      </div>
    </div>
  );
}

function SortIcon({ sort }: { sort: SortOption }) {
    switch (sort) {
        case "a-z": return <ArrowDownAZ className="h-4 w-4" />;
        case "z-a": return <ArrowUpAZ className="h-4 w-4" />;
        default: return <Clock className="h-4 w-4" />;
    }
}
