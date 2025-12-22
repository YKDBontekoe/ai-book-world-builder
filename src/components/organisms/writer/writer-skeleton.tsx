import { Skeleton } from "@/components/atoms/skeleton";

export function WriterSkeleton() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Left Panel: Outline (20%) */}
      <div className="w-[20%] min-w-[250px] border-r bg-muted/10 flex flex-col hidden md:flex">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4 shrink-0">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        {/* Navigation List */}
        <div className="flex-1 p-4 space-y-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32 font-medium" />
              <div className="pl-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel: Editor (Flex-1) */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        {/* Header */}
        <div className="flex h-10 items-center justify-between border-b px-4 bg-background/80 shrink-0">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-sm" />
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 p-8 md:p-12 overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Title */}
            <Skeleton className="h-12 w-3/4 rounded-lg" />

            {/* Paragraphs */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[98%]" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-[95%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Canvas (30%) */}
      <div className="w-[30%] min-w-[300px] border-l hidden lg:flex flex-col bg-muted/5">
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="space-y-6 w-full max-w-xs opacity-50">
             {/* Graph Nodes Placeholder */}
             <div className="relative h-64 w-full border-dashed border-2 border-muted-foreground/20 rounded-xl flex items-center justify-center">
                <div className="absolute top-1/4 left-1/4">
                   <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="absolute bottom-1/3 right-1/4">
                   <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                   <Skeleton className="h-16 w-16 rounded-full" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
