import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="mt-1 h-4 w-96" />
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-[200px] rounded-md" />
            <Skeleton className="h-9 w-[200px] rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        {/* Body rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b last:border-b-0 px-4 py-3"
          >
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}
