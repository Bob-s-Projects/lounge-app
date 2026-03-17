import { Package, Receipt, Percent, FolderOpen, LayoutDashboard } from "lucide-react"
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
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <LayoutDashboard className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
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
          icon={<Package className="size-4" />}
          variant="positive"
        />
        <MetricCard
          title="仕入れ品目数"
          value={metrics.totalSupplierItems.toLocaleString()}
          description={`価格表日付: ${metrics.supplierDate}`}
          icon={<Receipt className="size-4" />}
          variant="positive"
        />
        <MetricCard
          title="平均原価率"
          value={
            metrics.avgCostRatio !== null
              ? `${(metrics.avgCostRatio * 100).toFixed(1)}%`
              : "未設定"
          }
          description="原価設定済み商品の平均"
          icon={<Percent className="size-4" />}
          variant="warning"
        />
        <MetricCard
          title="カテゴリ数"
          value={metrics.categoryCount.toLocaleString()}
          description="POS登録カテゴリ"
          icon={<FolderOpen className="size-4" />}
          variant="neutral"
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

const VARIANT_STYLES = {
  positive: {
    card: "bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/5",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    card: "bg-gradient-to-br from-amber-50 to-amber-50/30 dark:from-amber-950/20 dark:to-amber-950/5",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  neutral: {
    card: "",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
} as const

function MetricCard({
  title,
  value,
  description,
  icon,
  variant = "neutral",
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  variant?: "positive" | "warning" | "neutral"
}) {
  const styles = VARIANT_STYLES[variant]
  return (
    <Card className={`shadow-sm hover:shadow-md transition-all duration-200 ${styles.card}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`flex size-8 items-center justify-center rounded-lg ${styles.iconBg}`}>
          <span className={styles.iconColor}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
}
