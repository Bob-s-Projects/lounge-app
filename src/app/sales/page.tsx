import { SidebarTrigger } from "@/components/ui/sidebar"
import { getSalesSummary } from "@/lib/data"
import { SalesDashboard } from "@/components/sales-dashboard"

export default function SalesPage() {
  const sales = getSalesSummary()

  const products = sales.products.map((p) => ({
    product_id: p.product_id,
    product_name: p.product_name,
    category_name: p.category_name,
    total_quantity: p.total_quantity,
    total_sales: p.total_sales,
    transaction_count: p.transaction_count,
    avg_price: p.avg_price,
  }))

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">売上分析</h1>
          <p className="text-sm text-muted-foreground">
            {sales.period.from} 〜 {sales.period.to}（90日間）
          </p>
        </div>
      </div>

      <SalesDashboard
        products={products}
        totalRevenue={sales.total_revenue}
        totalTransactions={sales.total_transactions}
        periodFrom={sales.period.from}
        periodTo={sales.period.to}
      />
    </div>
  )
}
