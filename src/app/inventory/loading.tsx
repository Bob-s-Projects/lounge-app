import { Skeleton } from "@/components/ui/skeleton"
import {
  SkeletonCardGrid,
  SkeletonTable,
} from "@/components/skeleton-patterns"

export default function InventoryLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-32" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div>
          <Skeleton className="h-7 w-36 mb-1" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* KPI Cards */}
      <SkeletonCardGrid />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Table */}
      <SkeletonTable rows={10} cols={7} />
    </div>
  )
}
