import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  SkeletonCardGrid,
  SkeletonTable,
} from "@/components/skeleton-patterns"

export default function MenuLoading() {
  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-7 w-52" />
        </div>
        <Skeleton className="mt-1 h-4 w-80" />
      </div>

      {/* Filter card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-9 w-[200px] rounded-md" />
            <Skeleton className="h-9 w-[200px] rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* 4 summary cards */}
      <SkeletonCardGrid />

      {/* ABC Matrix card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-56" />
          </div>
          <Skeleton className="h-3.5 w-80" />
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-lg">
            {/* Matrix header */}
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
            {/* Matrix rows */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Skeleton className="h-14 w-16" />
                <Skeleton className="h-14 flex-1" />
                <Skeleton className="h-14 flex-1" />
                <Skeleton className="h-14 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs + table card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-3.5 w-64" />
        </CardHeader>
        <CardContent>
          {/* Tab triggers */}
          <div className="flex flex-wrap gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md" />
            ))}
          </div>
          {/* Table placeholder */}
          <div className="rounded-lg border">
            <div className="flex items-center gap-4 border-b px-4 py-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-3.5 w-16" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b last:border-b-0 px-4 py-3"
              >
                {Array.from({ length: 9 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    className={`h-3.5 ${j === 0 ? "w-28" : j === 8 ? "w-40" : "w-16"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 20 table */}
      <SkeletonTable rows={8} cols={8} />

      {/* Dead stock table */}
      <SkeletonTable rows={5} cols={3} />
    </div>
  )
}
