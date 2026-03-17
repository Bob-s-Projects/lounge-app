import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export default function SuppliersLoading() {
  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-7 w-40" />
        </div>
        <Skeleton className="mt-1 h-4 w-52" />
      </div>

      {/* 4 summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-[200px] rounded-md" />
            <Skeleton className="h-9 w-[200px] rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        {/* Body rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b last:border-b-0 px-4 py-3"
          >
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-14" />
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
