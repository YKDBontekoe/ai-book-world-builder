import { Skeleton } from "@/components/atoms/skeleton";
import { GlassCard } from "@/components/molecules/glass-card";

export function TaskBoardSkeleton() {
  const columns = [
    { title: "Backlog", count: 3 },
    { title: "In Progress (Jules)", count: 2 },
    { title: "Review", count: 2 },
    { title: "Done", count: 3 },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-x-auto pb-4">
      <div className="flex h-full gap-6 min-w-[1000px]">
        {columns.map((col, i) => (
          <div key={i} className="w-[300px] flex-shrink-0 flex flex-col">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-muted-foreground/70">
                  {col.title}
                </h3>
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {Array.from({ length: col.count }).map((_, j) => (
                <GlassCard
                  key={j}
                  variant="liquid"
                  className="p-3 h-[120px] flex flex-col gap-3"
                >
                  {/* Top row: Icon/ID + Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  {/* Bottom: User/Meta */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-12 rounded" />
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
