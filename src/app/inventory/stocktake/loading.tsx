import { Skeleton } from "@/components/ui/skeleton"

export default function StocktakeLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div>
          <Skeleton className="h-7 w-28 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Sticky controls */}
      <div className="flex items-center justify-between rounded-xl border px-4 py-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Category groups */}
      {Array.from({ length: 3 }).map((_, gi) => (
        <div key={gi} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="rounded-xl border overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b last:border-b-0 px-4 py-3"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-7 w-40" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
