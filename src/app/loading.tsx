import { Skeleton } from "@/components/ui/skeleton"
import {
  SkeletonCardGrid,
  SkeletonChart,
} from "@/components/skeleton-patterns"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div>
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* 4 KPI cards */}
      <SkeletonCardGrid />

      {/* 2 charts side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  )
}
