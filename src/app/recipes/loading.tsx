import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function RecipesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-1.5 h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-8 w-full sm:flex-1 rounded-lg" />
        <Skeleton className="h-8 w-[300px] rounded-lg" />
      </div>

      {/* Recipe card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
