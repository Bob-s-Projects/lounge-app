import { Skeleton } from "@/components/ui/skeleton"
import {
  SkeletonCardGrid,
  SkeletonChart,
  SkeletonTable,
} from "@/components/skeleton-patterns"

export default function SalesLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div>
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 4 summary cards */}
        <SkeletonCardGrid />

        {/* Category chart */}
        <SkeletonChart />

        {/* Top 30 table */}
        <SkeletonTable rows={10} cols={7} />

        {/* Category detail tabs */}
        <SkeletonTable rows={6} cols={6} />
      </div>
    </div>
  )
}
