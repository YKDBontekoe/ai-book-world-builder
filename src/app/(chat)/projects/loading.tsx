import { PageContainer } from "@/components/page-container";
import { GlassCard } from "@/components/ui/glass-card";
import { GridList } from "@/components/ui/grid-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <PageContainer className="p-8 md:p-12 max-w-[1800px] mx-auto">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      <div className="mt-8">
        <Skeleton className="h-10 w-64 mb-6 rounded-lg" />

        <GridList columns={{ sm: 2, lg: 3, xl: 4 }} gap={8}>
          {Array.from({ length: 8 }).map((_, i) => (
            <GlassCard
              key={i}
              variant="liquid"
              className="h-[200px] p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-6 w-32 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border/30">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
            </GlassCard>
          ))}
        </GridList>
      </div>
    </PageContainer>
  );
}
