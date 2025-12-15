import { PageContainer } from "@/components/page-container";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
  return (
    <PageContainer className="p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-5 w-96 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-4 h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Content Skeleton */}
        <div className="lg:col-span-3">
          <GlassCard className="p-8 min-h-[500px]">
            <div className="flex justify-center mb-8">
              <Skeleton className="h-10 w-64 rounded-lg" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`h-4 rounded ${
                    i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-[95%]" : "w-[90%]"
                  }`}
                />
              ))}
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
