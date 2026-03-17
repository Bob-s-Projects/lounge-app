import {
  Warehouse,
  PackageSearch,
  AlertTriangle,
  CalendarClock,
  Layers,
} from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryDashboard } from "@/components/inventory-dashboard"
import { getInventoryItems } from "@/app/inventory/actions"

export const metadata = {
  title: "在庫管理 | 原価管理",
}

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const items = await getInventoryItems()

  const totalItems = items.length
  const belowPar = items.filter(
    (i) => i.par_level !== null && i.current_stock < i.par_level
  ).length
  const categories = new Set(items.map((i) => i.category)).size

  // Find the most recent stocktake date
  const lastStocktake = items
    .filter((i) => i.last_counted_at)
    .sort((a, b) => {
      const da = a.last_counted_at ? new Date(a.last_counted_at).getTime() : 0
      const db = b.last_counted_at ? new Date(b.last_counted_at).getTime() : 0
      return db - da
    })[0]?.last_counted_at

  const lastStocktakeFormatted = lastStocktake
    ? new Date(lastStocktake).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      })
    : "\u2014"

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Warehouse className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            在庫管理
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            在庫状況の確認・棚卸し・入出庫管理
          </p>
        </div>
      </div>

      {/* KPI Cards - only show when there are items */}
      {totalItems > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-indigo-50 to-indigo-50/30 dark:from-indigo-950/20 dark:to-indigo-950/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">在庫品目数</CardTitle>
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <PackageSearch className="size-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">
                {totalItems.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className={`shadow-sm hover:shadow-md transition-all duration-200 ${
              belowPar > 0
                ? "bg-gradient-to-br from-red-50 to-red-50/30 dark:from-red-950/20 dark:to-red-950/5 ring-1 ring-red-200 dark:ring-red-800/30"
                : "bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/5"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">発注点割れ</CardTitle>
              <div
                className={`flex size-8 items-center justify-center rounded-lg ${
                  belowPar > 0
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-emerald-100 dark:bg-emerald-900/30"
                }`}
              >
                <AlertTriangle
                  className={`size-4 ${
                    belowPar > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold tabular-nums ${
                  belowPar > 0 ? "text-red-600 dark:text-red-400" : ""
                }`}
              >
                {belowPar}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">最終棚卸</CardTitle>
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <CalendarClock className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">
                {lastStocktakeFormatted}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">カテゴリ数</CardTitle>
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Layers className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{categories}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <InventoryDashboard items={items} />
    </div>
  )
}
