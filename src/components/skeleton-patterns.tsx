import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

/**
 * KPI metric card skeleton - mimics icon + title + large number + subtitle
 */
export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

/**
 * Data table skeleton - header row + N body rows with varying widths
 */
export function SkeletonTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  const widths = ["w-32", "w-24", "w-20", "w-16", "w-28", "w-20", "w-16", "w-24"]

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          {/* Header */}
          <div className="flex items-center gap-4 border-b px-4 py-3">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className={`h-3.5 ${widths[i % widths.length]}`} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center gap-4 border-b last:border-b-0 px-4 py-3"
            >
              {Array.from({ length: cols }).map((_, colIdx) => (
                <Skeleton
                  key={colIdx}
                  className={`h-3.5 ${widths[(colIdx + rowIdx) % widths.length]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Chart area skeleton - rectangular placeholder with subtle pulse
 */
export function SkeletonChart() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3.5 w-52" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

/**
 * 4 KPI cards in responsive grid matching existing layout
 */
export function SkeletonCardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
