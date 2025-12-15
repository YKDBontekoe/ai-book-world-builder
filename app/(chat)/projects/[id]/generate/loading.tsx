import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Workspace Header Skeleton */}
      <header className="flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" /> {/* Back Button */}
          <div className="space-y-1">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-48 rounded-md" /> {/* Toggle Group */}
        </div>
      </header>

      {/* Main Workspace Skeleton */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full border border-border/40 rounded-xl bg-muted/5 flex items-center justify-center">
            {/* Subtle spinner or just blank canvas feeling */}
            <Skeleton className="h-full w-full rounded-xl opacity-20" />
        </div>
      </main>
    </div>
  );
}
