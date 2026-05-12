import { Skeleton, SkeletonTable, SkeletonCard } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-full animate-fade-in">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-56 border-r bg-white shrink-0">
        <div className="p-4 pt-6 flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="px-3 space-y-1 mt-4">
          <Skeleton className="h-3 w-16 mb-3" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="h-14 border-b flex items-center px-4 gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-4 w-32" />
        </header>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6 overflow-hidden bg-muted/20">
          {/* Page title */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-md" />
            ))}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Table */}
          <SkeletonTable rows={6} cols={5} />
        </main>
      </div>
    </div>
  );
}
