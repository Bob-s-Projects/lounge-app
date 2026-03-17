import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  SkeletonCardGrid,
  SkeletonChart,
  SkeletonTable,
} from "@/components/skeleton-patterns"

export default function AnalysisLoading() {
  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="mt-1 h-4 w-80" />
      </div>

      {/* 4 summary cards */}
      <SkeletonCardGrid />

      {/* 2 charts side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* High cost items table */}
      <SkeletonTable rows={10} cols={8} />

      {/* 3 suggestion cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-3.5 w-52" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
