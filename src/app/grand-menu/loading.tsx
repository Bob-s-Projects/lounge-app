import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { SkeletonCardGrid } from "@/components/skeleton-patterns"

export default function GrandMenuLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div>
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 4 summary cards */}
        <SkeletonCardGrid />

        {/* Menu tabs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-36 rounded-md" />
          ))}
        </div>

        {/* Section cards with item grids */}
        {Array.from({ length: 3 }).map((_, sectionIdx) => (
          <Card key={sectionIdx}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-10 rounded-md" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <Skeleton className="size-2 rounded-full" />
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-3.5 w-14" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Dead stock alert */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3.5 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3.5 w-80" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
