import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export default function SeasonalLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div>
          <Skeleton className="h-7 w-36 mb-1" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      {/* Current season highlight card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3.5 w-80" />
        </CardContent>
      </Card>

      {/* Season plan card with 4 season tiles */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="ml-auto h-5 w-16 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kakigori table card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <div>
              <Skeleton className="h-5 w-64 mb-1" />
              <Skeleton className="h-3.5 w-52" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-8 w-36 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
          <div className="rounded-lg border">
            {/* Table header */}
            <div className="flex items-center gap-4 border-b px-4 py-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b last:border-b-0 px-4 py-3"
              >
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planning section */}
      <div>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-8 mb-1" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="mt-3 h-3.5 w-60" />
      </div>
    </div>
  )
}
