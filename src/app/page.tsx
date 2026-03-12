import { Package, Receipt, Percent, FolderOpen } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  getDashboardMetrics,
  getProductCategories,
  getSupplierCategories,
} from "@/lib/data"
import {
  ProductCategoryChart,
  SupplierCategoryChart,
} from "@/components/dashboard-charts"

export default function DashboardPage() {
  const metrics = getDashboardMetrics()
  const productCategories = getProductCategories()
  const supplierCategories = getSupplierCategories()

  const productChartData = productCategories.slice(0, 10).map((c) => ({
    name: c.name,
    count: c.count,
  }))

  const supplierChartData = supplierCategories.slice(0, 10).map((c) => ({
    name: c.name,
    count: c.count,
  }))

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground">
            LEDIAN Lounge メニュー運用の全体像
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="商品数"
          value={metrics.totalProducts.toLocaleString()}
          description={`最終更新: ${formatDate(metrics.productsUpdatedAt)}`}
          icon={<Package className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          title="仕入れ品目数"
          value={metrics.totalSupplierItems.toLocaleString()}
          description={`価格表日付: ${metrics.supplierDate}`}
          icon={<Receipt className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          title="平均原価率"
          value={
            metrics.avgCostRatio !== null
              ? `${(metrics.avgCostRatio * 100).toFixed(1)}%`
              : "未設定"
          }
          description="原価設定済み商品の平均"
          icon={<Percent className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          title="カテゴリ数"
          value={metrics.categoryCount.toLocaleString()}
          description="POS登録カテゴリ"
          icon={<FolderOpen className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProductCategoryChart data={productChartData} />
        <SupplierCategoryChart data={supplierChartData} />
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
}
