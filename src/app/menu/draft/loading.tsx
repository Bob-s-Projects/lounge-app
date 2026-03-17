import { Skeleton } from "@/components/ui/skeleton";

export default function DraftLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Summary bar */}
      <Skeleton className="h-20 w-full rounded-xl" />

      {/* Legend */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Tabs */}
      <Skeleton className="h-10 w-96 rounded-lg" />

      {/* Before / After columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
